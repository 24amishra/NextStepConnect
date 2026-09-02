# Admin Dashboard: Partnerships Directory Redesign

Date: 2026-08-19
Status: Approved, ready for implementation plan

## Problem

The "Partnerships" tab of the admin dashboard (`src/pages/AdminDashboard.tsx`)
shows businesses and students as two flat, scrollable lists with only a text
search box. There's no way to:

- See a business's or student's full profile without leaving the page
- Sort the lists (e.g. by signup recency)
- See at a glance which businesses/students are unassigned, actively matched,
  or temporarily unavailable ("on hold")

This makes it hard for an admin to triage who needs attention.

## Goals

- Click any business or student to see their full profile in a modal
- Sort each list, defaulting to most-recently-created first
- A Kanban-style board view, mirrored for businesses and students, grouping
  by partnership status: **On Hold / Unassigned / Assigned**
- For students, a way to scan/filter by skill without a dedicated column per
  skill

## Non-goals

- Drag-and-drop status changes. Assigned/Unassigned are derived from real
  assignment data, not manually settable — creating an assignment requires
  picking a specific opportunity + student pair, which already has its own
  flow elsewhere in this dashboard (the "Assign" form further down the
  Partnerships tab). Reimplementing that as a drag gesture would either lose
  that pairing step or silently do something different than what dragging
  implies. Only the On Hold flag is admin-editable, via a button, not by
  dragging into a column.
- Server-side pagination/sorting. Both lists are already fetched in full into
  React state (`students`, `businesses`) with no pagination; sorting and
  filtering stay client-side.
- Changing anything about the existing "Assign student to opportunity" flow
  further down the Partnerships tab.

## Data model change

`BusinessData` and `StudentProfile` (`src/lib/firestore.ts`) each get one new
optional field:

```ts
onHold?: boolean;
```

Two new setter functions, following the existing pattern of other single-field
updates in this file:

```ts
export const setBusinessOnHold = async (businessId: string, onHold: boolean): Promise<void>
export const setStudentOnHold = async (userId: string, onHold: boolean): Promise<void>
```

Both write to the relevant Firestore doc (`businesses/{id}` for businesses —
this field is fine in the public doc, no private info involved — `students/{id}`
for students) with `{ onHold, updatedAt: new Date() }`.

## Status derivation

Not stored — computed from data already in memory, so no schema field for
"status" itself:

```ts
type PartnershipStatus = "assigned" | "on_hold" | "unassigned";

function getBusinessStatus(business: BusinessData, assignments: OpportunityAssignment[]): PartnershipStatus {
  const isAssigned = assignments.some(a => a.businessId === business.userId);
  if (isAssigned) return "assigned";
  if (business.onHold) return "on_hold";
  return "unassigned";
}

function getStudentStatus(student: StudentProfile, assignments: OpportunityAssignment[]): PartnershipStatus {
  const isAssigned = assignments.some(a => a.studentId === student.userId);
  if (isAssigned) return "assigned";
  if (student.onHold) return "on_hold";
  return "unassigned";
}
```

`assigned` always wins over `onHold` so a stale on-hold flag can never mask an
active partnership. These helpers live directly in `AdminDashboard.tsx`, since
they're only used there and only combine data the dashboard already loads.

## Components

New files under `src/components/admin/`:

- **`StatusBoard.tsx`** — generic 3-column Kanban shell. Props: an array of
  `{ id, status, ... }`-shaped items already bucketed (or a `getStatus`
  accessor), and a `renderCard` render-prop. Column order is fixed: On Hold,
  Unassigned, Assigned. Reused for both businesses and students so the two
  boards visually mirror each other, per the requirement that they look
  consistent.
- **`BusinessDetailModal.tsx`** — shadcn `Dialog` showing: company name,
  industry, categories (tags), location, contact person, email, phone,
  preferred contact method, their described need (`potentialProblems`),
  signup date (`createdAt`), current status badge, and an On Hold
  toggle button. All fields are already present on `BusinessData` as loaded
  by `getApprovedBusinesses()` (which merges the public doc and the private
  `businesses/{id}/private/details` subcollection) — no extra fetch needed.
- **`StudentDetailModal.tsx`** — mirrors the above: name, email, skills
  (tags), desired roles, bio, LinkedIn link, open-to-matching flag, matching
  categories/note, signup date, status badge, On Hold toggle, and — if
  currently assigned — which business/opportunity, read from `assignments`.

Both modals are triggered from either List or Board view, so they're the
single source of truth for "see everything about this business/student."

## AdminDashboard.tsx changes

In the Partnerships tab, each of the two existing Card sections (Businesses,
Students) gets:

- New state: `businessViewMode` / `studentViewMode` (`"list" | "board"`,
  default `"list"`), `businessSort` / `studentSort` state for the dropdown,
  `selectedBusiness` / `selectedStudent` for which modal is open.
- A segmented List/Board toggle next to the existing search input.
- **List mode**: existing search-filtered array, now also sorted by the
  chosen comparator, each row now a clickable button that opens the detail
  modal instead of static markup.
  - Business sort options: Newest first (default, `createdAt` desc), Oldest
    first, Name (A–Z), Industry (A–Z).
  - Student sort options: Newest first (default), Oldest first, Name (A–Z),
    Most skills.
- **Board mode**: renders `<StatusBoard>` with cards built from the same
  filtered/searched array (sort doesn't apply to board mode — columns are the
  grouping). For students, an additional row of clickable skill chips
  (derived from the union of all students' `skills`) above the board,
  ANDed with the existing text search.

### Card content

- Business card (List row and Board card use the same visual language):
  initials avatar, company name, `location · industry`, status badge,
  relative signup date (e.g. "2 days ago").
- Student card: initials avatar, name, up to 3 skill tags (+N more), status
  badge, relative signup date.

## Testing

- Manual verification in the browser (dev server), since this is a UI-only
  feature with no new backend logic beyond two simple Firestore field
  writes:
  - List view: sort changes reorder correctly; default is newest-first;
    search still filters as before; clicking a row opens the right modal
    with correct data.
  - Board view: businesses/students land in the correct column given
    `assignments` + `onHold`; toggling On Hold in the modal moves the card
    between columns without a page refresh; an assigned business/student
    never appears outside the Assigned column even if `onHold` is true.
  - Skill chip filter narrows the student board/list correctly and combines
    (AND) with the text search.
  - Existing "Assign student to opportunity" flow further down the tab is
    untouched and still works.
