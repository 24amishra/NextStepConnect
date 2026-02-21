# EmailJS Setup Guide for Questions Form

This guide explains how to set up EmailJS to enable the Questions form in the Student Dashboard.

## What is EmailJS?

EmailJS is a service that allows you to send emails directly from client-side JavaScript without needing a backend server. It's perfect for contact forms and support requests.

## Setup Steps

### 1. Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Set Up Email Service

1. After logging in, go to **Email Services** in the sidebar
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended for testing)
4. Follow the prompts to connect your email account
5. **Copy the Service ID** - you'll need this later

### 3. Create Email Template

1. Go to **Email Templates** in the sidebar
2. Click **Create New Template**
3. Use this template configuration:

**Template Name:** `student_question_template` (or any name you prefer)

**Subject:** `New Question from {{from_name}} - {{subject}}`

**Content:**
```
New question received from NextStep platform:

From: {{from_name}}
Email: {{from_email}}

Subject: {{subject}}

Message:
{{message}}

---
This email was sent from the NextStep Questions form.
```

4. **Copy the Template ID** - you'll need this later
5. Click **Save**

### 4. Get Your Public Key

1. Go to **Account** in the sidebar
2. Find your **Public Key** (it looks like: `YOUR_PUBLIC_KEY`)
3. **Copy the Public Key**

### 5. Configure Your Application

Open `src/pages/StudentDashboard.tsx` and find the `handleQuestionSubmit` function. Replace the placeholder values:

```typescript
// Find these lines in the handleQuestionSubmit function:
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key

await emailjs.send(
  'YOUR_SERVICE_ID',   // Replace with your service ID from step 2
  'YOUR_TEMPLATE_ID',  // Replace with your template ID from step 3
  {
    from_name: questionForm.name,
    from_email: questionForm.email,
    subject: questionForm.subject,
    message: questionForm.message,
    to_email: 'support@nextstep.com', // Change to your support email
  }
);
```

**Example with actual values:**
```typescript
emailjs.init('abc123XYZ456'); // Your public key

await emailjs.send(
  'service_xyz123',      // Your service ID
  'template_abc456',     // Your template ID
  {
    from_name: questionForm.name,
    from_email: questionForm.email,
    subject: questionForm.subject,
    message: questionForm.message,
    to_email: 'support@nextstep.com',
  }
);
```

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to Student Dashboard → Questions tab
3. Fill out and submit the form
4. Check your email inbox for the message

## EmailJS Free Tier Limits

The free tier includes:
- **200 emails per month**
- **2 email templates**
- **1 email service**

For higher volume, consider upgrading or implementing a backend email service.

## Troubleshooting

### Emails Not Sending

1. **Check browser console** for error messages
2. **Verify all IDs are correct** (Service ID, Template ID, Public Key)
3. **Check EmailJS dashboard** for failed sends under the Activity tab
4. **Ensure email service is connected** in EmailJS dashboard

### CORS Errors

EmailJS should work from localhost and deployed sites. If you encounter CORS issues:
1. Make sure you're using the correct public key
2. Check that your domain is allowed in EmailJS settings

### Template Variables Not Working

Make sure the variable names in your template match exactly:
- `{{from_name}}` → `from_name` in the code
- `{{from_email}}` → `from_email` in the code
- `{{subject}}` → `subject` in the code
- `{{message}}` → `message` in the code

## Alternative: Backend Email Service

If you prefer a backend solution or need more control, consider these alternatives:

### Option 1: Firebase Cloud Functions with SendGrid

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(functions.config().sendgrid.key);

export const sendSupportEmail = functions.https.onCall(async (data) => {
  const msg = {
    to: 'support@nextstep.com',
    from: 'noreply@nextstep.com',
    subject: `New Question: ${data.subject}`,
    text: `From: ${data.name} (${data.email})\n\n${data.message}`,
  };

  await sgMail.send(msg);
  return { success: true };
});
```

Then update the client code:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const handleQuestionSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const functions = getFunctions();
  const sendEmail = httpsCallable(functions, 'sendSupportEmail');

  await sendEmail({
    name: questionForm.name,
    email: questionForm.email,
    subject: questionForm.subject,
    message: questionForm.message,
  });
};
```

### Option 2: Custom API Endpoint

If you have your own backend:

```typescript
const handleQuestionSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  await fetch('https://your-api.com/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionForm),
  });
};
```

## Security Considerations

### Using EmailJS (Client-Side)

✅ **Pros:**
- No backend required
- Simple setup
- Free tier available

⚠️ **Cons:**
- Public key is visible in client code (this is normal and safe)
- Limited to EmailJS rate limits
- Less control over email formatting

### Using Backend Service

✅ **Pros:**
- More control and security
- Higher rate limits
- Can add spam protection
- Can store messages in database

⚠️ **Cons:**
- Requires backend infrastructure
- More complex setup
- May have costs

## Recommended Configuration

For NextStep, EmailJS is a good starting point because:
1. Simple to set up
2. No backend required
3. 200 emails/month should be sufficient for initial launch
4. Can migrate to backend service later if needed

## Support

For EmailJS issues, consult:
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Examples](https://www.emailjs.com/examples/)
- [EmailJS Support](https://www.emailjs.com/support/)

For NextStep-specific issues, contact your development team.
