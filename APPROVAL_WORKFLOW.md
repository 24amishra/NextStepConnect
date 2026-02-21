# Business Approval Workflow Documentation

This document explains the business approval workflow implementation for the NextStep platform.

## Overview

When a business registers on the platform, their account is placed "on hold" with a status of `pending`. They cannot access student data until an admin manually approves their account.

## Features Implemented

### 1. Database Schema Changes

**Location:** `src/lib/firestore.ts`

Added `approvalStatus` field to business records with three possible values:
- `pending` - Default for new registrations
- `approved` - Admin has approved the business
- `rejected` - Admin has rejected the business

The status is stored in the private subcollection at:
```
businesses/{userId}/private/details
```

This ensures the approval status is only visible to the business owner and admins.

### 2. Signup Flow

**Location:** `src/pages/BusinessSignup.tsx`

After completing registration, businesses see a confirmation message:
- "Registration Complete!"
- "Your account is under review."
- "You'll be notified via email once your account is approved."
- They are redirected to the login page after 4 seconds

An admin notification email is sent when a new business registers (currently logged to console).

### 3. Access Control

**Location:** `src/components/BusinessProtectedRoute.tsx`

A new route protection component that:
- Checks the user's approval status when accessing business routes
- Shows different messages based on status:
  - **Pending:** Informative waiting screen with next steps
  - **Rejected:** Explanation screen with contact information
  - **Approved:** Allows access to the protected content

**Protected Routes:**
- `/business/dashboard`
- `/business/applications`

These routes now use `BusinessProtectedRoute` instead of the generic `ProtectedRoute`.

### 4. Admin Approval Panel

**Location:** `src/pages/AdminDashboard.tsx`

A comprehensive admin dashboard that:
- Lists all pending business registrations
- Shows complete business details for review
- Provides "Approve" and "Reject" buttons
- Sends email notifications when approving/rejecting
- Updates in real-time as businesses are processed

**Access:** Navigate to `/admin/dashboard` when logged in as an admin.

**Note:** Currently, any authenticated user can access the admin dashboard. In production, you should add proper admin role checking.

### 5. Email Notifications

**Location:** `src/lib/emailNotifications.ts`

Three email notification functions:
1. `sendApprovalEmail()` - Sent when a business is approved
2. `sendRejectionEmail()` - Sent when a business is rejected
3. `sendAdminNotification()` - Sent when a new business registers

**Current Status:** These functions currently log to the browser console. See "Setting Up Email Notifications" below for production setup.

## Workflow Diagram

```
┌─────────────────────┐
│ Business Signs Up   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Account Created             │
│ Status: "pending"           │
│ Admin Notification Sent     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Business Tries to Login     │
│ & Access Dashboard          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ BusinessProtectedRoute      │
│ Checks Approval Status      │
└──────┬──────────────────────┘
       │
       ├─────────────┬─────────────┐
       │             │             │
   Pending       Rejected      Approved
       │             │             │
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Show     │  │ Show     │  │ Grant    │
│ Waiting  │  │ Rejection│  │ Access   │
│ Screen   │  │ Screen   │  │          │
└──────────┘  └──────────┘  └──────────┘
```

## Admin Workflow

```
┌─────────────────────┐
│ Admin Logs In       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Navigate to                 │
│ /admin/dashboard            │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ View List of Pending        │
│ Business Registrations      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Review Business Details     │
│ - Company info              │
│ - Contact info              │
│ - Project needs             │
└──────────┬──────────────────┘
           │
           ├─────────────┐
           │             │
       Approve       Reject
           │             │
           ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Update DB    │  │ Update DB    │
│ Status:      │  │ Status:      │
│ "approved"   │  │ "rejected"   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Send         │  │ Send         │
│ Approval     │  │ Rejection    │
│ Email        │  │ Email        │
└──────────────┘  └──────────────┘
```

## Setting Up Email Notifications

Currently, email notifications are logged to the console. To enable real email sending in production, choose one of these options:

### Option 1: Firebase Cloud Functions (Recommended)

1. **Install Firebase Functions:**
   ```bash
   firebase init functions
   ```

2. **Install an email service SDK:**
   ```bash
   cd functions
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

3. **Create a Cloud Function:**
   ```typescript
   // functions/src/index.ts
   import * as functions from 'firebase-functions';
   import * as sgMail from '@sendgrid/mail';

   sgMail.setApiKey(functions.config().sendgrid.key);

   export const sendApprovalEmail = functions.https.onCall(async (data) => {
     const msg = {
       to: data.to,
       from: 'noreply@nextstep.com',
       subject: 'Your NextStep Business Account Has Been Approved!',
       text: `Dear ${data.contactPersonName}, ...`,
       html: '<strong>...</strong>',
     };

     await sgMail.send(msg);
     return { success: true };
   });
   ```

4. **Update the client-side code:**
   ```typescript
   // src/lib/emailNotifications.ts
   import { getFunctions, httpsCallable } from 'firebase/functions';

   export const sendApprovalEmail = async (data: ApprovalEmailData) => {
     const functions = getFunctions();
     const sendEmail = httpsCallable(functions, 'sendApprovalEmail');
     await sendEmail({
       to: data.contactEmail,
       businessName: data.businessName,
       contactPersonName: data.contactPersonName,
     });
   };
   ```

5. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

### Option 2: Third-Party Email Service (EmailJS)

1. **Install EmailJS:**
   ```bash
   npm install @emailjs/browser
   ```

2. **Update email notifications:**
   ```typescript
   import emailjs from '@emailjs/browser';

   emailjs.init('YOUR_PUBLIC_KEY');

   export const sendApprovalEmail = async (data: ApprovalEmailData) => {
     await emailjs.send(
       'YOUR_SERVICE_ID',
       'YOUR_TEMPLATE_ID',
       {
         to_email: data.contactEmail,
         to_name: data.contactPersonName,
         business_name: data.businessName,
       }
     );
   };
   ```

### Option 3: Custom Backend API

Create your own backend API endpoint that handles email sending, then call it from the client.

## Security Considerations

### Admin Access Control

**Current Implementation:** Any authenticated user can access `/admin/dashboard`.

**Recommended for Production:**

1. **Use Firebase Custom Claims:**
   ```typescript
   // Set admin claim (backend only)
   await admin.auth().setCustomUserClaims(uid, { admin: true });
   ```

2. **Check in AdminProtectedRoute:**
   ```typescript
   const { currentUser } = useAuth();
   const token = await currentUser?.getIdTokenResult();
   if (!token?.claims.admin) {
     return <Navigate to="/" />;
   }
   ```

3. **Add Firestore Security Rules:**
   ```
   match /businesses/{businessId}/private/{document} {
     allow read: if request.auth.uid == businessId ||
                    request.auth.token.admin == true;
     allow write: if request.auth.uid == businessId ||
                     request.auth.token.admin == true;
   }
   ```

### Environment Variables

Store sensitive configuration in environment variables:

```env
# .env.local
VITE_ADMIN_EMAILS=admin1@nextstep.com,admin2@nextstep.com
VITE_SENDGRID_API_KEY=your_api_key
```

## Testing the Workflow

### Test as a Business User

1. Navigate to `/business/signup`
2. Complete the registration form
3. After signup, you should see the "Under Review" message
4. Try to access `/business/dashboard` - you'll see the pending approval screen
5. Check browser console for admin notification log

### Test as an Admin

1. Login as an admin user
2. Navigate to `/admin/dashboard`
3. You should see the newly registered business
4. Click "Approve" or "Reject"
5. Check browser console for email notification logs

### Test Approved Access

1. After admin approves a business
2. Logout and login as that business user
3. You should now have full access to `/business/dashboard` and `/business/applications`

## Database Structure

```
firestore/
├── businesses/
│   └── {userId}/
│       ├── (public fields)
│       │   ├── companyName
│       │   ├── location
│       │   ├── industry
│       │   ├── contactPersonName
│       │   ├── email
│       │   ├── preferredContactMethod
│       │   ├── potentialProblems
│       │   ├── categories
│       │   └── businessId
│       └── private/
│           └── details/
│               ├── userId
│               ├── phone
│               ├── createdAt
│               ├── updatedAt
│               └── approvalStatus ← "pending" | "approved" | "rejected"
```

## Files Modified/Created

### Created Files:
- `src/components/BusinessProtectedRoute.tsx` - Access control for business routes
- `src/pages/AdminDashboard.tsx` - Admin approval interface
- `src/lib/emailNotifications.ts` - Email notification service
- `APPROVAL_WORKFLOW.md` - This documentation

### Modified Files:
- `src/lib/firestore.ts` - Added approval status fields and admin functions
- `src/pages/BusinessSignup.tsx` - Updated completion message and flow
- `src/App.tsx` - Added admin route and updated business route protection
- `src/components/BusinessProtectedRoute.tsx` - New component for business-specific protection

## Future Enhancements

1. **Admin Dashboard Improvements:**
   - Add search/filter functionality
   - Show all businesses (not just pending)
   - Add bulk approve/reject
   - Show approval history/audit log

2. **Email Templates:**
   - Create HTML email templates
   - Add business logo to emails
   - Include more personalization

3. **Notifications:**
   - Add in-app notifications
   - Add SMS notifications option
   - Send reminder emails if approval takes too long

4. **Analytics:**
   - Track approval times
   - Monitor rejection reasons
   - Generate reports on business onboarding

## Support

For questions or issues with the approval workflow, contact the development team or open an issue in the repository.
