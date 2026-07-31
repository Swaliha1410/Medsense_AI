# 🔧 Google OAuth Troubleshooting Guide

## Your Current Setup:
- **Project ID:** medsense-503816
- **Client ID:** 321069766069-rsddojrcptcb0n22osr4hk236drromdb.apps.googleusercontent.com
- **Error:** "flowName=GeneralOAuthFlow" / "Access blocked" / "OAuth client not found"

## ✅ Step-by-Step Fix:

### Step 1: Verify OAuth Client Configuration

1. **Go to your OAuth Client:**
   👉 https://console.cloud.google.com/apis/credentials?project=medsense-503816

2. **Click on your OAuth 2.0 Client** (the one with ID starting with 321069766069)

3. **Check Authorized JavaScript origins:**
   
   Should have these EXACT URLs (add if missing):
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
   
   ⚠️ **Important:**
   - Use `http://` not `https://`
   - No trailing slash `/` at the end
   - Port must match your dev server (usually 5173 for Vite)

4. **Check Authorized redirect URIs:**
   
   Should have these EXACT URLs (add if missing):
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```

5. **Click SAVE** after making changes

### Step 2: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen:**
   👉 https://console.cloud.google.com/apis/credentials/consent?project=medsense-503816

2. **Check Publishing Status:**
   - Should say **"Testing"** (for development)
   - If it says "In Production", that's fine too

3. **Add Test Users (CRITICAL!):**
   - Scroll down to **"Test users"** section
   - Click **"+ ADD USERS"**
   - Add YOUR Gmail address (the one you'll use to sign in)
   - Click **"SAVE"**

4. **Verify App Information:**
   - App name: Should be set (e.g., "MedSense")
   - User support email: Should be set
   - Developer contact: Should be set

### Step 3: Check Your Current Dev Server URL

Open your browser and verify what URL you're using:

**Current URL should be:** `http://localhost:5173/auth`

**NOT:**
- ❌ `http://127.0.0.1:5173/auth` (different from localhost)
- ❌ `https://localhost:5173/auth` (https not http)
- ❌ `http://localhost:3000/auth` (wrong port)

If using different URL, add it to authorized origins!

### Step 4: Clear Browser Cache

Sometimes browser cache causes issues:

1. **Chrome:** Open DevTools (F12) > Application > Clear storage > Clear site data
2. Or try **Incognito Mode** (Ctrl+Shift+N)

### Step 5: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Step 6: Enable Required APIs

1. **Go to API Library:**
   👉 https://console.cloud.google.com/apis/library?project=medsense-503816

2. **Search and Enable these APIs:**
   - ✅ Google+ API (REQUIRED!)
   - ✅ Google Identity Toolkit API
   - ✅ Identity and Access Management (IAM) API

3. Click **"ENABLE"** for each

### Step 7: Verify .env File

Your `.env` should look like this (NO quotes!):

```env
VITE_GOOGLE_CLIENT_ID=321069766069-rsddojrcptcb0n22osr4hk236drromdb.apps.googleusercontent.com
```

**NOT:**
```env
VITE_GOOGLE_CLIENT_ID='321069766069-rsddojrcptcb0n22osr4hk236drromdb.apps.googleusercontent.com'
```

### Step 8: Test Again

1. Stop dev server (Ctrl+C)
2. Start dev server: `npm run dev`
3. Go to: `http://localhost:5173/auth`
4. Click "Sign in with Google"
5. Select your Gmail account (must be added as test user!)

## 🐛 Still Not Working?

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured or app not verified

**Fix:**
1. Complete OAuth consent screen configuration
2. Add your email as test user
3. Make sure app is in "Testing" mode

### Error: "redirect_uri_mismatch"

**Cause:** The URL doesn't match authorized redirect URIs

**Fix:**
1. Check the error message for the exact URL being used
2. Add that EXACT URL to authorized redirect URIs in Google Console
3. Common fix: Add both `http://localhost:5173` AND `http://127.0.0.1:5173`

### Error: "OAuth client was not found" or "invalid_client"

**Cause:** Wrong Client ID or Client ID not properly configured

**Fix:**
1. Verify Client ID in .env matches Google Console
2. Remove any quotes around Client ID
3. Restart dev server after changing .env
4. Check that OAuth client type is "Web application" not "Android/iOS"

### Error: "idpiframe_initialization_failed"

**Cause:** Third-party cookies blocked

**Fix:**
1. Enable third-party cookies in browser settings
2. Or test in Incognito mode
3. Add exceptions for `accounts.google.com` and `localhost`

## 📸 Screenshot Checklist

Your Google Console should show:

### OAuth Client Screen:
```
Application type: Web application
Name: MedSense Web (or similar)

Authorized JavaScript origins:
  • http://localhost:5173
  • http://localhost:3000
  • http://127.0.0.1:5173

Authorized redirect URIs:
  • http://localhost:5173
  • http://localhost:3000
  • http://127.0.0.1:5173
```

### OAuth Consent Screen:
```
Publishing status: Testing
Test users: your-email@gmail.com (added)
App name: MedSense
User support email: your-email@gmail.com
```

## 🎯 Quick Test Commands

Run these to verify setup:

```bash
# 1. Check if .env is loaded
npm run dev

# 2. Check browser console (F12) for errors

# 3. Try incognito mode
Ctrl+Shift+N (Chrome)
```

## 📞 Need More Help?

1. **Check browser console (F12)** for specific error messages
2. **Check Network tab** to see the failed request
3. **Try a different browser** (sometimes helps!)
4. **Check if you're using the correct Google account** (must be added as test user)

## ✅ Success Checklist

- [ ] OAuth consent screen configured
- [ ] Test user added (your email)
- [ ] Authorized origins include `http://localhost:5173`
- [ ] Authorized redirect URIs include `http://localhost:5173`
- [ ] Client ID in .env has NO quotes
- [ ] Dev server restarted after changing .env
- [ ] Using correct URL: `http://localhost:5173/auth`
- [ ] Google+ API enabled
- [ ] Trying with test user account

