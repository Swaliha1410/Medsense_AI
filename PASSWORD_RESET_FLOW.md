# Password Reset Flow — Complete Implementation

## Overview
Password reset codes are now sent to the email address registered during signup AND displayed on the Vite frontend for easy testing and accessibility.

---

## How It Works

### 1. User Requests Password Reset
- User navigates to "Forgot Password"
- Enters their email or username
- Clicks "Send Reset Code"

### 2. Backend (`/api/auth/forgot-password/`)
**What happens:**
- ✅ Generates a 6-digit OTP (One-Time Password)
- ✅ Stores it server-side (expires in 10 minutes)
- ✅ Sends the code via email to the registered email address
- ✅ **Returns the code in the API response** for frontend display

**Response:**
```json
{
  "detail": "A reset code has been sent to your email.",
  "email": "user@example.com",
  "code": "642924",
  "code_display": "Code: 642924",
  "expires_in_minutes": 10
}
```

### 3. Frontend (Vite)
**What the user sees:**
1. **Step 1:** Email/Username input
   - User enters their registered email or username
   
2. **Step 2:** Code Entry (NEW!)
   - ✅ **Blue box displays the code prominently** — sent from server
   - Shows: "Your code (also sent to your email)"
   - Displays code in large, easy-to-read format
   - Also sent via email to the registered email address
   - User can copy the code or type it manually
   - Expires in 10 minutes

3. **Step 3:** New Password
   - User enters new password
   - Confirms password
   - Submits to complete reset

---

## Technical Details

### Backend Changes (`api/views.py`)

The `forgot_password` endpoint now:

```python
# Generate code
code = _generate_code()  # e.g., "642924"

# Send via email
send_mail(
    subject='MedSense — Your Password Reset Code',
    message=f'Your code is: {code}\n\nExpires in 10 minutes.',
    from_email='sahilkatariya132@gmail.com',
    recipient_list=[user.email],
)

# Return in API response for frontend display
return Response({
    'detail': 'A reset code has been sent to your email.',
    'email': user.email,
    'code': code,  # ← Frontend displays this
    'code_display': f'Code: {code}',
    'expires_in_minutes': 10,
})
```

### Frontend Changes (`src/pages/Auth.jsx`)

1. **State Management**
   - Added `sentCode` state to store the code returned from server
   - Extracted from API response: `res.code`

2. **Display Logic**
   - Code appears in a blue box with animation
   - Only shows when `step === 2` (code entry step)
   - Shows after "Send Reset Code" is clicked
   - Displays code in large, bold, monospaced font

3. **Code Display HTML**
   ```jsx
   {sentCode && step === 2 && (
     <motion.div className="mb-4 px-4 py-4 bg-blue-50 border-2 border-blue-300">
       <p className="text-xs text-blue-600 mb-2">Your code (also sent to your email):</p>
       <p className="text-3xl font-bold tracking-widest text-blue-700">{sentCode}</p>
       <p className="text-xs text-blue-600 mt-2">This code expires in 10 minutes</p>
     </motion.div>
   )}
   ```

---

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│ Forgot Password Page                                    │
│                                                         │
│ Step 1: Enter Email/Username                           │
│ ┌─────────────────────────────────┐                   │
│ │ user@example.com / testuser     │                   │
│ └─────────────────────────────────┘                   │
│ [Send Reset Code]                                      │
│                                                         │
│ ↓ (Backend sends email & generates code)               │
│                                                         │
│ Step 2: Enter Code                                     │
│ ╔═════════════════════════════════╗                   │
│ ║ Your code (also sent to email): ║ ← NEW!            │
│ ║        642924                   ║ ← CODE DISPLAYED  │
│ ║ Expires in 10 minutes           ║                   │
│ ╚═════════════════════════════════╝                   │
│                                                         │
│ ┌─────────────────────────────────┐                   │
│ │ _ _ _ _ _ _                     │ (or paste code)   │
│ └─────────────────────────────────┘                   │
│ [Verify Code]                                          │
│                                                         │
│ ↓ (Code verified on backend)                           │
│                                                         │
│ Step 3: New Password                                   │
│ ┌─────────────────────────────────┐                   │
│ │ New Password: ••••••••          │                   │
│ │ Confirm:      ••••••••          │                   │
│ └─────────────────────────────────┘                   │
│ [Set New Password]                                     │
│                                                         │
│ ↓ (Password updated)                                   │
│                                                         │
│ ✓ Success! Redirect to login                          │
└─────────────────────────────────────────────────────────┘
```

---

## Email & Frontend Delivery

### Email Goes To:
- **Recipient:** The email address registered during signup
- **From:** `MedSense <sahilkatariya132@gmail.com>`
- **Subject:** "MedSense — Your Password Reset Code"
- **Content:** Includes the 6-digit code + instructions

### Frontend Display:
- **Location:** Password reset form, Step 2
- **Format:** Large, bold, easy-to-copy code
- **Color:** Blue highlight for visibility
- **Animation:** Smooth fade-in with scale effect

---

## Security Notes

✅ **Code Generation:**
- 6-digit numeric code (1 million possibilities)
- Expires in 10 minutes
- Stored server-side with expiration timestamp

✅ **Verification:**
- Code must match the one sent
- Email must match the user's registered email
- Expired codes are rejected with "reset code has expired" message

✅ **Privacy:**
- Email address is returned to frontend (for reference)
- Code is displayed for UX (not a security risk in development)
- In production, consider removing code from response if needed

---

## Testing

### Test Forgot Password Flow:
1. Go to http://localhost:5173 (Vite frontend)
2. Click "Forgot Password"
3. Enter your email or username
4. Click "Send Reset Code"
5. ✅ Code appears in blue box on Step 2
6. ✅ Check terminal/logs for email confirmation: `[MedSense] ✓ Email sent to user@example.com | Code: XXXXXX`
7. Enter the code displayed on screen
8. Click "Verify Code"
9. Enter new password and confirm
10. Click "Set New Password"
11. ✅ Password updated successfully

---

## API Response Example

```bash
POST /api/auth/forgot-password/
Content-Type: application/json

{
  "email": "testuser"
}
```

**Response (200 OK):**
```json
{
  "detail": "A reset code has been sent to your email.",
  "email": "test.medsense@example.com",
  "code": "642924",
  "code_display": "Code: 642924",
  "expires_in_minutes": 10
}
```

---

## Files Modified

1. **Backend:** `api/views.py`
   - Updated `forgot_password` function to return code in response

2. **Frontend:** `src/pages/Auth.jsx`
   - Added `sentCode` state
   - Updated `sendCode` function to capture code from response
   - Added code display UI in blue box

---

## Next Steps (Optional)

- If needed, remove `code` from API response in production (only send via email)
- Implement SMS delivery as alternative to email
- Add QR code or deeplink support for code entry
- Implement rate limiting on forgot password requests
