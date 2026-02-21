/**
 * Email Notification Service
 *
 * This module provides email notification functionality for the approval workflow.
 *
 * IMPORTANT: To use these functions in production, you need to set up one of the following:
 *
 * Option 1: Firebase Cloud Functions (Recommended)
 * - Create a Firebase Cloud Function that sends emails using a service like SendGrid, Mailgun, or AWS SES
 * - Call the function from the client using Firebase callable functions
 * - See: https://firebase.google.com/docs/functions/callable
 *
 * Option 2: Backend API
 * - Set up a backend API endpoint that sends emails
 * - Call the endpoint from these functions
 *
 * Option 3: Third-party service (e.g., EmailJS)
 * - Use a client-side email service (note: less secure as API keys are exposed)
 * - See: https://www.emailjs.com/
 *
 * For now, these are placeholder functions that log to console.
 */

export interface ApprovalEmailData {
  businessName: string;
  contactEmail: string;
  contactPersonName: string;
}

/**
 * Send approval notification email
 * @param data Business information for the email
 */
export const sendApprovalEmail = async (data: ApprovalEmailData): Promise<void> => {
  try {
    console.log("===== APPROVAL EMAIL =====");
    console.log("To:", data.contactEmail);
    console.log("Subject: Your NextStep Business Account Has Been Approved!");
    console.log("Body:");
    console.log(`
Dear ${data.contactPersonName},

Great news! Your business account for ${data.businessName} has been approved.

You now have full access to:
- View student profiles and applications
- Post project opportunities
- Connect with talented students

Login to your dashboard to get started:
${window.location.origin}/business/login

Welcome to NextStep!

Best regards,
The NextStep Team
    `);
    console.log("========================");

    // TODO: Replace with actual email sending logic
    // Example with Firebase Cloud Functions:
    /*
    const functions = getFunctions();
    const sendEmail = httpsCallable(functions, 'sendApprovalEmail');
    await sendEmail({
      to: data.contactEmail,
      businessName: data.businessName,
      contactPersonName: data.contactPersonName,
    });
    */

    // For now, just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw error;
  }
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

If you believe this is an error or would like more information, please contact our support team at support@nextstep.com.

We appreciate your interest and hope to work with you in the future.

Best regards,
The NextStep Team
    `);
    console.log("==========================");

    // TODO: Replace with actual email sending logic
    // Example with Firebase Cloud Functions:
    /*
    const functions = getFunctions();
    const sendEmail = httpsCallable(functions, 'sendRejectionEmail');
    await sendEmail({
      to: data.contactEmail,
      businessName: data.businessName,
      contactPersonName: data.contactPersonName,
    });
    */

    // For now, just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
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

    // TODO: Replace with actual email sending logic

    // For now, just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error sending admin notification:", error);
    throw error;
  }
};
