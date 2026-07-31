# 🔑 How to Get Your Google OAuth Client ID

## Your Project ID: medsense-503816
**Note:** This is NOT your Client ID - you need to create OAuth credentials!

## Step-by-Step Instructions:

### 1. Open Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials?project=medsense-503816

### 2. Configure OAuth Consent Screen (If Not Done)
If you see a warning about OAuth consent screen:

1. Click **"CONFIGURE CONSENT SCREEN"**
2. Choose **"External"** (unless you have Google Workspace)
3. Click **"CREATE"**
4. Fill in the form:
   - **App name:** MedSense
   - **User support email:** Your email
   - **App logo:** (Optional - can skip)
   - **App domain:** (Can skip for now)
   - **Authorized domains:** (Can skip for now)
   - **Developer contact:** Your email
5. Click **"SAVE AND CONTINUE"**
6. **Scopes:** Click "SAVE AND CONTINUE" (keep default)
7. **Test users:** 
   - Click "ADD USERS"
   - Add your email address
   - Click "ADD"
   - Click "SAVE AND CONTINUE"
8. Click **"BACK TO DASHBOARD"**

### 3. Create OAuth Client ID

1. Go back to **Credentials** page:
   https://console.cloud.google.com/apis/credentials?project=medsense-503816

2. Click **"+ CREATE CREDENTIALS"**

3. Select **"OAuth client ID"**

4. Choose **"Web application"**

5. Fill in:
   - **Name:** MedSense Web Client
   
   - **Authorized JavaScript origins:**
     Click "ADD URI" and add:
     ```
     http://localhost:5173
     ```
     Click "ADD URI" again and add:
     ```
     http://localhost:3000
     ```
   
   - **Authorized redirect URIs:**
     Click "ADD URI" and add:
     ```
     http://localhost:5173
     ```
     Click "ADD URI" again and add:
     ```
     http://localhost:3000
     ```

6. Click **"CREATE"**

7. A popup will show with your credentials:
   - **Your Client ID** - Copy this! It looks like:
     `123456789-abcdefghijk12345.apps.googleusercontent.com`
   - **Your Client Secret** - You can copy this too (for backend)

8. Click **"OK"**

### 4. Update Your .env File

Copy your Client ID and update `.env`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_FROM_STEP_7
```

Example:
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk12345.apps.googleusercontent.com
```

### 5. Restart Dev Server

```bash
# Press Ctrl+C to stop current server
# Then start again:
npm run dev
```

### 6. Test It!

1. Go to http://localhost:5173/auth
2. Click "Sign in with Google"
3. Should work now! ✅

## 🐛 Still Getting "OAuth client was not found" Error?

Make sure:
- ✅ Client ID is copied correctly (no extra spaces)
- ✅ .env file is in project root (same folder as package.json)
- ✅ Dev server was restarted after updating .env
- ✅ Using http://localhost:5173 (not http://127.0.0.1:5173)

## 📝 Quick Reference

- **Project ID:** medsense-503816 (This is NOT your Client ID!)
- **OAuth Client ID:** Will look like `123456789-abc...xyz.apps.googleusercontent.com`
- **Console Link:** https://console.cloud.google.com/apis/credentials?project=medsense-503816

