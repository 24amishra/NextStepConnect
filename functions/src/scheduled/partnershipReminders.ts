import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendEmail, TEAM_EMAIL } from "../services/emailClient";

const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");
// Shared secret required to hit the manual HTTP trigger, so the endpoint can't
// be spammed (each call sends a real email + burns Gmail send quota).
const reminderTriggerToken = defineSecret("REMINDER_TRIGGER_TOKEN");

// --- Tunable thresholds (in days) -------------------------------------------
// A partnership with no uploaded/signed contract this many days after it was
// assigned shows up in the "contracts" section.
const CONTRACT_NUDGE_AFTER_DAYS = 2;
// A midpoint meeting shows up once it is within this many days (or overdue).
const MIDPOINT_UPCOMING_WITHIN_DAYS = 2;
// A completed project shows up for rating this many days after completion.
const RATING_PROMPT_AFTER_DAYS = 1;
// ---------------------------------------------------------------------------

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ADMIN_DASHBOARD_URL = "https://www.joinnextstep.it.com/admin/dashboard";

interface ReminderItems {
  contracts: string[];
  midpoints: string[];
  ratings: string[];
}

/** Normalize a Firestore Timestamp / Date / string into a JS Date, or null. */
function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function daysSince(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);
}

function daysUntil(date: Date, now: Date): number {
  return Math.ceil((date.getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Scan Firestore and collect the partnership lifecycle items that need a human
 * nudge, grouped into three buckets. Pure read — sends nothing.
 */
async function collectReminderItems(now: Date): Promise<ReminderItems> {
  const db = admin.firestore();

  // Small caches so we don't re-fetch the same business/student repeatedly.
  const businessNameCache = new Map<string, string>();
  const studentNameCache = new Map<string, string>();

  async function businessName(id: string): Promise<string> {
    if (businessNameCache.has(id)) return businessNameCache.get(id)!;
    const snap = await db.doc(`businesses/${id}`).get();
    const name = (snap.data()?.companyName as string) || "(unknown business)";
    businessNameCache.set(id, name);
    return name;
  }

  async function studentName(id: string): Promise<string> {
    if (studentNameCache.has(id)) return studentNameCache.get(id)!;
    const snap = await db.doc(`students/${id}`).get();
    const name = (snap.data()?.name as string) || "(unknown student)";
    studentNameCache.set(id, name);
    return name;
  }

  const contracts: string[] = [];
  const midpoints: string[] = [];
  const ratings: string[] = [];

  // --- 1 & 2: walk every partnership assignment (both new opportunity-level
  // and legacy business-level assignments live in "assignedStudents"). ------
  const assignmentsSnap = await db.collectionGroup("assignedStudents").get();

  for (const docSnap of assignmentsSnap.docs) {
    const data = docSnap.data();
    const parentCollection = docSnap.ref.parent.parent?.parent.id; // "opportunities" | "businesses"
    const parentId = docSnap.ref.parent.parent?.id;

    const studentId = (data.studentId as string) || docSnap.id;
    const businessId =
      (data.businessId as string) ||
      (parentCollection === "businesses" ? parentId : undefined);

    const sName = await studentName(studentId);
    const bName = businessId ? await businessName(businessId) : "(unknown business)";
    const pair = `${sName} ↔ ${bName}`;

    // Contract signing nudge
    const assignedAt = toDate(data.assignedAt);
    if (!data.contractPdfUrl && assignedAt) {
      const age = daysSince(assignedAt, now);
      if (age >= CONTRACT_NUDGE_AFTER_DAYS) {
        contracts.push(`${pair} — no signed contract yet (assigned ${age} day${age === 1 ? "" : "s"} ago)`);
      }
    }

    // Midpoint meeting reminder
    if (!data.midpointMeetingCompleted) {
      const meeting = toDate(data.midpointMeetingDate);
      if (meeting) {
        const until = daysUntil(meeting, now);
        const when = meeting.toLocaleDateString("en-US", { timeZone: "America/New_York" });
        if (until < 0) {
          midpoints.push(`${pair} — midpoint meeting was ${Math.abs(until)} day${Math.abs(until) === 1 ? "" : "s"} ago (${when}), still not marked complete`);
        } else if (until <= MIDPOINT_UPCOMING_WITHIN_DAYS) {
          const label = until === 0 ? "today" : `in ${until} day${until === 1 ? "" : "s"}`;
          midpoints.push(`${pair} — midpoint meeting ${label} (${when})`);
        }
      }
    }
  }

  // --- 3: completed projects awaiting a rating -----------------------------
  // Status flips from "completed" to "rated" once a rating is saved, so this
  // query naturally excludes anything already rated.
  const completedSnap = await db
    .collection("applications")
    .where("status", "==", "completed")
    .get();

  for (const docSnap of completedSnap.docs) {
    const app = docSnap.data();
    const completedAt = toDate(app.completedAt);
    if (!completedAt) continue;
    const age = daysSince(completedAt, now);
    if (age >= RATING_PROMPT_AFTER_DAYS) {
      const title = app.opportunityTitle ? ` “${app.opportunityTitle}”` : "";
      ratings.push(`${app.businessName || "A business"} → rate ${app.studentName || "student"}${title} — completed ${age} day${age === 1 ? "" : "s"} ago, not rated yet`);
    }
  }

  return { contracts, midpoints, ratings };
}

/**
 * Build and send the digest email for the given items. Returns the total number
 * of items (0 = nothing sent). `now` and `items` are passed in so callers share
 * one consistent snapshot.
 */
async function sendDigest(appPassword: string, items: ReminderItems, now: Date): Promise<number> {
  const { contracts, midpoints, ratings } = items;
  const totalItems = contracts.length + midpoints.length + ratings.length;
  if (totalItems === 0) {
    logger.info("partnershipReminders: nothing to action");
    return 0;
  }

  const section = (title: string, emoji: string, list: string[]): string =>
    list.length
      ? `${emoji} ${title} (${list.length})\n` + list.map((i) => `  • ${i}`).join("\n") + "\n\n"
      : "";

  const text =
    `NextStep — partnership items needing action (${now.toLocaleDateString("en-US", { timeZone: "America/New_York" })})\n\n` +
    section("Contracts awaiting signature", "📝", contracts) +
    section("Midpoint meetings", "📅", midpoints) +
    section("Projects awaiting a rating", "⭐", ratings) +
    `Take action: ${ADMIN_DASHBOARD_URL}\n`;

  const htmlSection = (title: string, list: string[]): string =>
    list.length
      ? `<h3 style="margin:20px 0 6px">${title} <span style="color:#888;font-weight:400">(${list.length})</span></h3>` +
        `<ul style="margin:0;padding-left:20px;line-height:1.6">` +
        list.map((i) => `<li>${i}</li>`).join("") +
        `</ul>`
      : "";

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;max-width:640px">` +
    `<h2 style="margin-bottom:2px">Partnership items needing action</h2>` +
    `<p style="color:#888;margin-top:0">${now.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>` +
    htmlSection("📝 Contracts awaiting signature", contracts) +
    htmlSection("📅 Midpoint meetings", midpoints) +
    htmlSection("⭐ Projects awaiting a rating", ratings) +
    `<p style="margin-top:24px"><a href="${ADMIN_DASHBOARD_URL}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open admin dashboard</a></p>` +
    `</div>`;

  await sendEmail(appPassword, {
    to: TEAM_EMAIL,
    subject: `NextStep: ${totalItems} partnership item${totalItems === 1 ? "" : "s"} need action`,
    text,
    html,
  });

  logger.info("partnershipReminders sent", {
    contracts: contracts.length,
    midpoints: midpoints.length,
    ratings: ratings.length,
  });
  return totalItems;
}

/**
 * Daily digest of partnership lifecycle items that need a human nudge:
 *  1. Contracts not yet signed/uploaded
 *  2. Midpoint meetings coming up or overdue
 *  3. Completed projects still awaiting a rating
 *
 * Runs once a day and emails a consolidated "needs action" list to the team
 * inbox. Because it is a fresh snapshot each day, items appear when they become
 * due and drop off automatically once resolved — no per-item send tracking
 * needed for this v1.
 */
export const partnershipReminders = onSchedule(
  {
    schedule: "every day 09:00",
    timeZone: "America/New_York",
    secrets: [gmailAppPassword],
  },
  async () => {
    const now = new Date();
    const items = await collectReminderItems(now);
    await sendDigest(gmailAppPassword.value(), items, now);
  }
);

/**
 * Manual on-demand trigger for the same digest, so you can test it without
 * waiting for 9am. Requires ?token=<REMINDER_TRIGGER_TOKEN>.
 *
 * Add ?dryRun=1 to compute the digest and return the item counts as JSON
 * WITHOUT sending an email.
 *
 *   curl "https://<region>-<project>.cloudfunctions.net/triggerPartnershipReminders?token=YOUR_TOKEN"
 *   curl "https://<region>-<project>.cloudfunctions.net/triggerPartnershipReminders?token=YOUR_TOKEN&dryRun=1"
 */
export const triggerPartnershipReminders = onRequest(
  { secrets: [gmailAppPassword, reminderTriggerToken] },
  async (req, res) => {
    const provided = (req.query.token as string) || "";
    const expected = reminderTriggerToken.value();
    if (!expected || provided !== expected) {
      res.status(403).json({ error: "Forbidden: missing or invalid token" });
      return;
    }

    const now = new Date();
    const items = await collectReminderItems(now);
    const counts = {
      contracts: items.contracts.length,
      midpoints: items.midpoints.length,
      ratings: items.ratings.length,
    };

    const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true";
    if (dryRun) {
      res.status(200).json({ sent: false, dryRun: true, counts, items });
      return;
    }

    const totalSent = await sendDigest(gmailAppPassword.value(), items, now);
    res.status(200).json({ sent: totalSent > 0, counts });
  }
);
