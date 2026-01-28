# Firestore Security Rules Setup

## Quick Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy and paste the rules from `firestore.rules` file
5. Click **Publish**

## Rules Explanation

The rules ensure that:
- ✅ Users can only read/write their own business data (where document ID matches their user ID)
- ✅ Only authenticated users can access the businesses collection
- ✅ All other collections are protected by default

## Testing

After publishing the rules:
- Try logging in as a business user
- The dashboard should now load without permission errors
