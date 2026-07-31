# 🔐 Google OAuth Setup Guide for MedSense

## ✅ What's Been Done

1. **Installed Packages:**
   - `@react-oauth/google` - Google OAuth library
   - `jwt-decode` - To decode Google JWT tokens

2. **Updated Files:**
   - `src/App.jsx` - Added GoogleOAuthProvider wrapper
   - `src/pages/Auth.jsx` - Added Google login button and handler
   - `.env` - Created for storing Google Client ID

## 📋 Step-by-Step Setup Instructions

### Step 1: Get Your Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create/Select a Project:**
   - Click "Select a project" dropdown
   - Click "New Project"
   - Name it "MedSense" or similar
   - Click "Create"

3. **Enable Required APIs:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: "External"
     - App name: "MedSense"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Keep default
     - Test users: Add your email
     - Click "Save and Continue"
   
   - After consent screen setup:
     - Application type: "Web application"
     - Name: "MedSense Web Client"
     
   - **Authorized JavaScript origins** (Add these URLs):
     ```
     http://localhost:5173
     http://localhost:3000
     http://127.0.0.1:5173
     ```
   
   - **Authorized redirect URIs** (Add these URLs):
     ```
     http://localhost:5173
     http://localhost:3000
     http://127.0.0.1:5173
     ```
   
   - Click "Create"

5. **Copy Your Client ID:**
   - You'll see a popup with your Client ID
   - It looks like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
   - Copy this ID!

### Step 2: Configure Your Application

1. **Update .env file:**
   ```bash
   # Open .env file in your project root
   # Replace YOUR_GOOGLE_CLIENT_ID_HERE with your actual Client ID
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   ```

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Start it again
   npm run dev
   ```

### Step 3: Test Google Login

1. **Go to the Auth page:**
   - Navigate to `http://localhost:5173/auth`

2. **Try Google Login:**
   - Click the "Sign in with Google" button
   - Select your Google account
   - Allow permissions
   - You should be logged in!

## 🔧 Backend Integration (Important!)

Currently, the Google login is using a temporary workaround. For production, you need to:

### Option 1: Django Backend Integration

1. **Install Django packages:**
   ```bash
   pip install social-auth-app-django
   pip install python-social-auth
   ```

2. **Update Django settings.py:**
   ```python
   INSTALLED_APPS = [
       ...
       'social_django',
   ]

   AUTHENTICATION_BACKENDS = [
       'social_core.backends.google.GoogleOAuth2',
       'django.contrib.auth.backends.ModelBackend',
   ]

   SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = 'YOUR_GOOGLE_CLIENT_ID'
   SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET'
   
   SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
       'https://www.googleapis.com/auth/userinfo.email',
       'https://www.googleapis.com/auth/userinfo.profile',
   ]
   ```

3. **Create API endpoint:**
   ```python
   # In api/views.py
   from rest_framework.decorators import api_view
   from rest_framework.response import Response
   from google.oauth2 import id_token
   from google.auth.transport import requests
   
   @api_view(['POST'])
   def google_auth(request):
       token = request.data.get('credential')
       try:
           idinfo = id_token.verify_oauth2_token(
               token, 
               requests.Request(), 
               settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
           )
           
           # Get or create user
           email = idinfo['email']
           user, created = User.objects.get_or_create(
               email=email,
               defaults={
                   'username': email,
                   'first_name': idinfo.get('given_name', ''),
                   'last_name': idinfo.get('family_name', ''),
               }
           )
           
           # Generate token for user
           token, _ = Token.objects.get_or_create(user=user)
           
           return Response({
               'token': token.key,
               'user': {
                   'id': user.id,
                   'username': user.username,
                   'email': user.email,
                   'first_name': user.first_name,
                   'last_name': user.last_name,
               }
           })
       except ValueError:
           return Response({'error': 'Invalid token'}, status=400)
   ```

4. **Update frontend Auth.jsx:**
   ```javascript
   const handleGoogleSuccess = async (credentialResponse) => {
     try {
       setLoading(true)
       setError('')
       
       // Send to your backend
       const response = await fetch('http://localhost:8000/api/auth/google/', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ credential: credentialResponse.credential })
       })
       
       const data = await response.json()
       
       if (response.ok) {
         // Save token and user data
         localStorage.setItem('token', data.token)
         localStorage.setItem('user', JSON.stringify(data.user))
         navigate('/dashboard', { replace: true })
       } else {
         setError(data.error || 'Google login failed')
       }
     } catch (err) {
       console.error('Google login error:', err)
       setError('Google login failed. Please try again.')
     } finally {
       setLoading(false)
     }
   }
   ```

## 🎨 Customizing the Google Button

You can customize the Google button appearance:

```javascript
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  theme="outline"           // or "filled_blue", "filled_black"
  size="large"              // or "medium", "small"
  text="signin_with"        // or "signup_with", "continue_with", "signin"
  shape="rectangular"       // or "pill", "circle", "square"
  width="100%"
  logo_alignment="left"     // or "center"
/>
```

## 🚀 Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add your production domain to authorized origins
   - Example: `https://medsense.com`

2. **Update .env for production:**
   - Use environment variables in your hosting platform
   - Never commit .env to git!

3. **Add .env to .gitignore:**
   ```
   .env
   .env.local
   .env.production
   ```

## 🐛 Troubleshooting

### "Google Sign-in button not showing"
- Check that VITE_GOOGLE_CLIENT_ID is set in .env
- Restart your dev server after changing .env
- Check browser console for errors

### "Invalid Client ID"
- Verify the Client ID matches exactly from Google Cloud Console
- Check for extra spaces or characters
- Make sure the Client ID is for "Web application" type

### "redirect_uri_mismatch"
- Add your current URL to authorized redirect URIs in Google Cloud Console
- Include both http://localhost:5173 and http://localhost:3000

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user
- Make sure app is in "Testing" mode initially

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google NPM](https://www.npmjs.com/package/@react-oauth/google)
- [Django Social Auth](https://python-social-auth.readthedocs.io/)

## ✅ Current Status

- ✅ Google OAuth button integrated
- ✅ Client-side token handling working
- ⚠️ Backend integration needed for production
- ⚠️ Remember to add your Google Client ID to .env!

