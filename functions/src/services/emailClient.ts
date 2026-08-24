import nodemailer from "nodemailer";
import * as logger from "firebase-functions/logger";

/**
 * Server-side email sender for NextStep automations.
 *
 * Sends through the team Gmail account (nextstep.connects@gmail.com) using an
 * app password. Generate one at https://myaccount.google.com/apppasswords with
 * 2FA enabled, then store it as a Firebase secret:
 *
 *   firebase functions:secrets:set GMAIL_APP_PASSWORD
 *
 * Note: client-side emails (src/lib/emailNotifications.ts) still use EmailJS and
 * are unaffected. This path exists specifically for scheduled/background jobs,
 * which cannot run in a browser.
 */

// The Gmail account we send from and, for now, also send TO (founder digest).
export const TEAM_EMAIL = "nextstep.connects@gmail.com";

export interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send a single email via Gmail SMTP. `appPassword` is the resolved value of
 * the GMAIL_APP_PASSWORD secret (pass it in from the calling function).
 */
export async function sendEmail(
  appPassword: string,
  { to, subject, text, html }: SendEmailArgs
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: TEAM_EMAIL,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from: `NextStep <${TEAM_EMAIL}>`,
    to,
    subject,
    text,
    html: html || text,
  });

  logger.info("Email sent", { to, subject });
}
