# 🔗 Google OAuth + Django Backend Integration

## ✅ What's Been Implemented

### Backend (Django):
1. ✅ Installed `google-auth` package
2. ✅ Created `/api/auth/google/` endpoint in `api/views.py`
3. ✅ Added URL route in `api/urls.py`
4. ✅ Token verification with Google
5. ✅ Auto-create users in database
6. ✅ Return Django auth token

### Frontend (React):
1. ✅ Updated `Auth.jsx` to send Google credential to backend
2. ✅ Store Django auth token in localStorage
3. ✅ Navigate to dashboard after successful login

## 🚀 How It Works

### Flow:
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User selects Google account
4. Google returns JWT credential token
5. **Frontend sends credential to Django: `POST /api/auth/google/`**
6. **Django verifies token with Google**
7. **Django creates/gets user from database**
8. **Django returns auth token + user data**
9. Frontend saves token to localStorage
10. User is logged in!

## 📋 Testing the Integration

### Step 1: Start Django Backend

```bash
cd "c:\Users\MY PC\Downloads\Medsense_AI-main\Medsense_AI-main"
python manage.py runserver
```

Should see: `Starting development server at http://127.0.0.1:8000/`

### Step 2: Start React Frontend

```bash
# In a new terminal
cd "c:\Users\MY PC\Downloads\Medsense_AI-main\Medsense_AI-main"
npm run dev
```

Should see: `Local: http://localhost:5173/`

### Step 3: Test Google Login

1. Go to: http://localhost:5173/auth
2. Click "Sign in with Google"
3. Select your Google account
4. Check browser console (F12) - should see:
   ```
   ✅ Google login successful!
   User: { id: 1, username: "your@gmail.com", email: "your@gmail.com", ... }
   New user: true  (if first time login)
   ```
5. Should redirect to dashboard
6. **Check Django database** - user should be saved!

## 🔍 Verify User in Django Database

### Method 1: Django Admin

```bash
# Create superuser if you haven't
python manage.py createsuperuser

# Start server
python manage.py runserver

# Go to http://localhost:8000/admin
# Login with superuser credentials
# Click "Users" - you should see the Google-authenticated user!
```

### Method 2: Django Shell

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User

# List all users
users = User.objects.all()
for user in users:
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

# Check specific user
user = User.objects.get(email="your@gmail.com")
print(f"Name: {user.first_name} {user.last_name}")
print(f"Created: {user.date_joined}")
```

### Method 3: API Endpoint

```bash
# After logging in with Google, get your token from browser localStorage
# Then make a request:
curl -H "Authorization: Token YOUR_TOKEN_HERE" http://localhost:8000/api/auth/me/
```

## 🛠️ Backend API Details

### Endpoint: `POST /api/auth/google/`

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
}
```

**Response (Success):**
```json
{
  "token": "abc123def456...",
  "user": {
    "id": 1,
    "username": "john.doe@gmail.com",
    "email": "john.doe@gmail.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "created": true,
  "google_picture": "https://lh3.googleusercontent.com/..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid Google token"
}
```

## 🔒 What Gets Saved to Database

When a user logs in with Google, Django automatically creates:

### User Model:
- `username`: Google email (e.g., "john.doe@gmail.com")
- `email`: Google email
- `first_name`: From Google profile
- `last_name`: From Google profile
- `is_active`: True
- `date_joined`: Current timestamp

### Auth Token:
- Unique token for API authentication
- Stored in `authtoken_token` table
- Used for subsequent API requests

### User Profile (if exists):
- Creates `UserProfile` automatically
- Can store additional data like Google profile picture

## 🎨 Customizing the Backend

### 1. Store Google ID

Edit `api/views.py` - `google_auth` function:

```python
# Add this after getting user profile
profile, _ = UserProfile.objects.get_or_create(user=user)
# Store Google ID in profile
# You'll need to add a field to UserProfile model first
# profile.google_id = google_id
# profile.save()
```

### 2. Download and Save Google Profile Picture

```python
import requests
from django.core.files.base import ContentFile

if picture:
    response = requests.get(picture)
    if response.status_code == 200:
        profile.profile_picture.save(
            f'google_{google_id}.jpg',
            ContentFile(response.content),
            save=True
        )
```

### 3. Add Email Verification

```python
# After creating user
user.email_verified = True  # Add this field to UserProfile
user.save()
```

## 🐛 Troubleshooting

### Error: "Module 'google.oauth2' not found"

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### Error: "Invalid Google token"

- Make sure `GOOGLE_CLIENT_ID` in `api/views.py` matches your `.env` file
- Update line 75 in `api/views.py`:
  ```python
  GOOGLE_CLIENT_ID = '321069766069-rsddojrcptcb0n22osr4hk236drromdb.apps.googleusercontent.com'
  ```

### Error: "CORS policy" / "Access-Control-Allow-Origin"

Make sure `corsheaders` is configured in Django settings:

```python
# settings.py
INSTALLED_APPS = [
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### Error: "User already exists"

The backend handles this automatically - it will just login the existing user.

### Frontend shows "Failed to connect to server"

1. Check Django is running: http://localhost:8000/api/auth/google/
2. Check CORS settings in Django
3. Check Network tab in browser DevTools (F12)

## 📊 Database Schema

After Google login, your database will have:

```
auth_user:
+----+-------------------------+------------+-----------+
| id | username                | first_name | last_name |
+----+-------------------------+------------+-----------+
| 1  | john.doe@gmail.com      | John       | Doe       |
+----+-------------------------+------------+-----------+

authtoken_token:
+----------------+---------+---------------------+
| key            | user_id | created             |
+----------------+---------+---------------------+
| abc123def456...| 1       | 2024-01-15 10:30:00 |
+----------------+---------+---------------------+

api_userprofile:
+----+---------+------------------+--------+
| id | user_id | profile_picture  | ...    |
+----+---------+------------------+--------+
| 1  | 1       | (Google pic URL) | ...    |
+----+---------+------------------+--------+
```

## ✅ Success Indicators

You know it's working when:

1. ✅ Click "Sign in with Google" opens Google popup
2. ✅ Select account doesn't show errors
3. ✅ Browser console shows "✅ Google login successful!"
4. ✅ Redirects to /dashboard
5. ✅ User appears in Django database
6. ✅ Auth token is generated
7. ✅ Subsequent API calls work with token

## 🚀 Next Steps

1. **Add Profile Picture Download** - Save Google avatar to your server
2. **Email Verification** - Mark Google users as verified
3. **Link Multiple Auth Methods** - Allow users to add password later
4. **Admin Dashboard** - View all Google-authenticated users
5. **Analytics** - Track Google login usage

## 📖 References

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Django Rest Framework Token Auth](https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication)
- [Google Auth Python Library](https://google-auth.readthedocs.io/)

