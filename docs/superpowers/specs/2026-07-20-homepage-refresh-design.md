# Homepage refresh: font, background, logo, nav, FAQ

## Context

The site currently uses Newsreader (a formal editorial serif) for all headings, which
reads as "too classic/professional" for NextStep's brand. The page background is an
off-white/cream (`--nextstep-offwhite`), the logo asset has a beige box baked into the
PNG, and the top nav exposes "Student Login" / "Business Login" as separate buttons
next to "Sign Up," which the site owner doesn't want surfaced at the top level.

## Decisions

1. **Heading font** — Replace `Newsreader` with `Plus Jakarta Sans` as `font-heading`
   everywhere. Body (`Fustat`) and mono (`DM Mono`) are unchanged. Single-point change:
   the Google Fonts `<link>` in `index.html` and the `fontFamily.heading` value in
   `tailwind.config.ts`; every heading in the app uses the `font-heading` Tailwind class
   already, so no per-component edits are needed.

2. **Background** — Change `--nextstep-offwhite` in `src/index.css` from the current
   cream/beige HSL value to pure white (`0 0% 100%`). Red accents, the dark
   `--nextstep-brick` nav/footer, and all other tokens stay as-is.

3. **Logo** — Replace all four usages of `src/assets/NextStepLogo.png` (which has a
   beige background baked in) with the new `src/assets/images/nextsteptransparent.png`
   (transparent background, red mark, white "NextStep" wordmark). Usages: `Hero.tsx`,
   `Footer.tsx`, `SignupChoice.tsx`, `StudentDashboard.tsx` — all on the dark
   `nextstep-brick` nav/header, so the transparent file works everywhere without a
   visible box. The other two files dropped into `src/assets/images/`
   (`NextStepLogo.png`, `NextStepLogo1.png`, both opaque-white-background crops) are
   kept in that folder as spares but not wired in anywhere.

4. **Nav restructure** — In `Hero.tsx` (and the equivalent header markup in
   `SignupChoice.tsx` / dashboard headers where the same three buttons appear), replace
   the separate "Student Login" and "Business Login" buttons with a single **Log In**
   dropdown (click/hover, using the existing shadcn `dropdown-menu` component) that
   reveals "Student Login" and "Business Login" as menu items. **Sign Up** remains a
   single button linking to `/signup`, which already renders the student/business
   chooser cards — no changes needed on that page's content, only its nav header if it
   duplicates the login buttons.

5. **FAQ section** — New `FAQ.tsx` component using the existing shadcn `accordion`
   component, placed on `Index.tsx` between `AboutUs` and `Footer`. Six questions,
   grouped by audience label (For students / For businesses / General), copy as below
   (grounded in existing on-site claims: compensation language from `HowItWorks.tsx`'s
   "Flexible Compensation" card, and the nonprofit/no-contracts language from
   `Disclaimer.tsx`):

   - **For students**
     - *Do I get paid?* Compensation is worked out directly with the business. Both
       paid and volunteer projects are available, and either way you walk away with a
       real deliverable for your portfolio.
     - *How do I get matched with a project?* Apply with your major, skills, and
       interests, and we'll match you with a business project that fits.
   - **For businesses**
     - *What does this cost?* Compensation is entirely up to you and the student you
       work with. Paid and volunteer arrangements are both welcome.
     - *Is NextStep involved in the contract or liability?* No. NextStep is a nonprofit
       connector that doesn't sign contracts or manage agreements. Arrangements are
       made directly between you and the student.
   - **General**
     - *How does the matching process work?* Discovery, Connection, Execution: you
       share what you need, we match you with an aligned student, and they execute
       using our frameworks and resources.
     - *How do I sign up?* Hit Sign Up and choose Student or Business. It takes under a
       minute.

## Out of scope

- No changes to `/signup`, `/student/*`, `/business/*` page content beyond swapping the
  logo image and, where present, the duplicated login-button nav.
- No new testimonials or partner logos (existing placeholders in
  `StudentHowItWorks.tsx` / `FirstCohortPartners.tsx` are untouched).
