/**
 * Email Notification Service
 *
 * Uses EmailJS for client-side email sending.
 * Configure your EmailJS account at https://www.emailjs.com/
 *
 * Required env vars:
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_WELCOME_TEMPLATE_ID
 *   VITE_EMAILJS_BUSINESS_WELCOME_TEMPLATE_ID
 *   VITE_EMAILJS_BUSINESS_APPROVED_TEMPLATE_ID
 *   VITE_EMAILJS_CONTACT_TEMPLATE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 */

import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const EMAILJS_BUSINESS_WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BUSINESS_WELCOME_TEMPLATE_ID;
const EMAILJS_BUSINESS_APPROVED_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BUSINESS_APPROVED_TEMPLATE_ID;
const EMAILJS_STUDENT_MATCHED_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STUDENT_MATCHED_TEMPLATE_ID;
const EMAILJS_CONTACT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface WelcomeEmailData {
  to_email: string;
  to_name: string;
}

/**
 * Send welcome email to a student after signup via EmailJS.
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_WELCOME_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS is not configured. Skipping welcome email.");
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_WELCOME_TEMPLATE_ID,
    {
      to_email: data.to_email,
      to_name: data.to_name,
    },
    EMAILJS_PUBLIC_KEY,
  );
};

export interface BusinessWelcomeEmailData {
  to_email: string;
  to_name: string;
  company_name: string;
}

/**
 * Send welcome email to a business after signup.
 * Tells them their account is pending approval.
 */
export const sendBusinessWelcomeEmail = async (data: BusinessWelcomeEmailData): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_BUSINESS_WELCOME_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS is not configured. Skipping business welcome email.");
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_BUSINESS_WELCOME_TEMPLATE_ID,
    {
      to_email: data.to_email,
      to_name: data.to_name,
      company_name: data.company_name,
    },
    EMAILJS_PUBLIC_KEY,
  );
};

export interface ContactMessageData {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}

/**
 * Send a "Contact support" message (from the dashboard Questions form) to the
 * NextStep team inbox. Returns false without throwing if EmailJS isn't
 * configured yet, so callers can tell "not set up" apart from "network error".
 */
export const sendContactMessage = async (data: ContactMessageData): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_CONTACT_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS contact template is not configured. Skipping contact message.");
    return false;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_CONTACT_TEMPLATE_ID,
    {
      from_name: data.fromName,
      from_email: data.fromEmail,
      subject: data.subject,
      message: data.message,
      to_email: "nextstep.connects@gmail.com",
    },
    EMAILJS_PUBLIC_KEY,
  );
  return true;
};

export interface ApprovalEmailData {
  businessName: string;
  contactEmail: string;
  contactPersonName: string;
}

/**
 * Send approval notification email to a business via EmailJS.
 * Includes a link to the business login page.
 */
export const sendApprovalEmail = async (data: ApprovalEmailData): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_BUSINESS_APPROVED_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS is not configured. Skipping approval email.");
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_BUSINESS_APPROVED_TEMPLATE_ID,
    {
      to_email: data.contactEmail,
      to_name: data.contactPersonName,
      company_name: data.businessName,
      login_url: `${window.location.origin}/business/login`,
    },
    EMAILJS_PUBLIC_KEY,
  );
};

/**
 * Send rejection notification email
 * @param data Business information for the email
 */
export const sendRejectionEmail = async (data: ApprovalEmailData): Promise<void> => {
  try {
    console.log("===== REJECTION EMAIL =====");
    console.log("To:", data.contactEmail);
    console.log("Subject: Update on Your NextStep Business Account Application");
    console.log("Body:");
    console.log(`
Dear ${data.contactPersonName},

Thank you for your interest in NextStep.

After reviewing your application for ${data.businessName}, we're unable to approve your business account at this time. This may be due to:
- Incomplete business information
- Verification requirements not met
- Business type not aligned with our platform

If you believe this is an error or would like more information, please contact our support team at nextstep.connects@gmail.com


We appreciate your interest and hope to work with you in the future.

Best regards,
The NextStep Team
    `);
    console.log("==========================");

    // TODO: Replace with actual EmailJS template when needed
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
};

export interface MatchEmailData {
  studentEmail: string;
  studentName: string;
  companyName: string;
}

/**
 * Notify a student that they've been matched to a business/opportunity.
 */
export const sendMatchEmail = async (data: MatchEmailData): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_STUDENT_MATCHED_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn("EmailJS student-matched template is not configured. Logging email instead.");
    console.log("===== STUDENT MATCH EMAIL =====");
    console.log(`To: ${data.studentEmail}`);
    console.log(`Subject: You've Been Matched!`);
    console.log(`
Dear ${data.studentName},

You've been matched! We're excited to let you know that you have been matched to a business!

The opportunity will be with ${data.companyName}.

Check out your dashboard for more info:
${window.location.origin}/student/dashboard

Best regards,
The NextStep Team
    `);
    console.log("===============================");
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_STUDENT_MATCHED_TEMPLATE_ID,
    {
      to_email: data.studentEmail,
      to_name: data.studentName,
      company_name: data.companyName,
      dashboard_url: `${window.location.origin}/student/dashboard`,
    },
    EMAILJS_PUBLIC_KEY,
  );
};

/**
 * Send notification to admin when a new business registers
 * @param data Business information for the email
 */
export const sendAdminNotification = async (data: ApprovalEmailData): Promise<void> => {
  try {
    console.log("===== ADMIN NOTIFICATION =====");
    console.log("To: admin@nextstep.com");
    console.log("Subject: New Business Registration Pending Approval");
    console.log("Body:");
    console.log(`
A new business has registered and is pending approval:

Business Name: ${data.businessName}
Contact Person: ${data.contactPersonName}
Contact Email: ${data.contactEmail}

Review and approve/reject at:
${window.location.origin}/admin/dashboard

NextStep Admin System
    `);
    console.log("==============================");

    // TODO: Replace with actual EmailJS template when needed
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error sending admin notification:", error);
    throw error;
  }
};
