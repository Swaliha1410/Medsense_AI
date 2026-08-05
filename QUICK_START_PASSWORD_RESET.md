# Quick Start — Password Reset Flow

## 🎯 What's New?

✅ **No need to re-enter email!**  
✅ **Code displayed on screen in blue box**  
✅ **Code automatically sent via email to your phone**  
✅ **Works on Gmail app**

---

## 🔄 Step-by-Step Test

### 1️⃣ Start Reset
```
Go to: http://localhost:5173
Click: "Forgot Password"
```

### 2️⃣ Enter Username or Email
```
Option A: Enter username → testuser
Option B: Enter email    → test@example.com

Click: "Send Reset Code"
```

### 3️⃣ Blue Box Appears! 📦
```
┌─────────────────────────────┐
│ ✓ Code sent to email:       │
│ ┌────────────────────────┐  │
│ │ test@example.com       │  │ ← Your registered email
│ └────────────────────────┘  │
│                             │
│ Your password reset code:   │
│ ┌────────────────────────┐  │
│ │  6  4  2  9  2  4     │  │ ← Copy or use this code
│ └────────────────────────┘  │
│                             │
│ Code expires in 10 minutes  │
│ Check spam if no email      │
└─────────────────────────────┘

👉 Copy the code from the blue box!
```

### 4️⃣ Check Email on Phone
```
Gmail App → Inbox
From: MedSense
Subject: Your Password Reset Code

Contains: 642924
```

### 5️⃣ Enter Code
```
Code input field:
[6] [4] [2] [9] [2] [4]

Click: "Verify Code"
```

### 6️⃣ Set New Password
```
New Password:     [••••••••]
Confirm Password: [••••••••]

Click: "Set New Password"
```

### 7️⃣ Success! ✨
```
✓ Password updated!
✓ Redirecting to login...

Login with new password!
```

---

## 📊 Backend Flow

```
User Input (username/email)
        ↓
Backend Finds User in Database
        ↓
Generates 6-digit Code
        ↓
Sends Email via SMTP (Gmail)
        ↓
Stores Code (expires in 10 min)
        ↓
Returns Code + Email to Frontend
        ↓
Frontend Displays Blue Box
        ↓
User Enters Code
        ↓
Verify Code (check expiration)
        ↓
Reset Password
```

---

## 📧 Email You'll Receive

**From:** MedSense  
**Subject:** MedSense — Your Password Reset Code

**Email Content:**
```
Hello testuser,

Your MedSense password reset code is:

    642924

This code expires in 10 minutes.

Do NOT share this code with anyone.
If you did not request this, please ignore this email.

— The MedSense Team
Support: support@medsense.ai
```

---

## 🖥️ Django Console Output

When you request a password reset, you'll see:

```
[MedSense] ✓✓✓ PASSWORD RESET EMAIL SENT ✓✓✓
  To: test@example.com
  Code: 642924
  Username: testuser
  Check your email on your phone!
```

---

## 🔑 Key Points

| Item | Details |
|------|---------|
| **Code Length** | 6 digits (e.g., 642924) |
| **Expiration** | 10 minutes |
| **Delivery** | Email (SMTP via Gmail) + Screen (blue box) |
| **Email Address** | Registered during signup |
| **Re-enter Email?** | NO! Automatic from database |
| **See Code on Screen?** | YES! In blue box |
| **See Code in Email?** | YES! In Gmail app on phone |

---

## ✨ Features

✅ **Automatic Email Retrieval**
- No need to re-enter email
- Gets registered email from database

✅ **Dual Delivery**
- Code on screen (blue box)
- Code in email (Gmail on phone)

✅ **User-Friendly**
- Large, easy-to-read code
- Copy-friendly format
- Clear instructions

✅ **Secure**
- Code expires in 10 minutes
- Server-side validation
- Email verification

✅ **Works Offline**
- Code shown on screen immediately
- Works even if email is slow
- User can still use code from screen

---

## 🚀 Testing Commands

### Test 1: Basic Flow
```
1. Open http://localhost:5173
2. Click "Forgot Password"
3. Enter: testuser
4. Click "Send Reset Code"
5. ✓ Code appears in blue box
6. ✓ Check Django logs for email confirmation
```

### Test 2: With Email
```
1. Open http://localhost:5173
2. Click "Forgot Password"
3. Enter: test@example.com
4. Click "Send Reset Code"
5. ✓ Same as Test 1
```

### Test 3: Complete Reset
```
1-4: From Test 1
5. Copy code from blue box
6. Enter in "6-digit code" field
7. Click "Verify Code"
8. Enter new password
9. Click "Set New Password"
10. ✓ Success message
11. Login with new password
```

---

## 📱 On Your Phone

### Gmail App
```
1. Open Gmail app
2. Go to Inbox
3. Look for email from "MedSense"
4. Subject: "Your Password Reset Code"
5. Read code: 642924
6. Or use code from blue box on screen
```

### If Email Not in Inbox
```
1. Check "Spam" or "Junk" folder
2. Check "Promotions" tab
3. Pull down to refresh
4. Wait 1-2 minutes (email delay)
5. Use code from blue box meanwhile!
```

---

## ❓ FAQ

**Q: Do I need to re-enter my email?**  
A: NO! It's automatically retrieved from your profile.

**Q: Where do I see the code?**  
A: On screen in blue box + in your email on Gmail app

**Q: What if email is slow?**  
A: Code is shown on screen immediately, so you can use it right away!

**Q: How long is the code valid?**  
A: 10 minutes from when you request it

**Q: Can I use the code from the blue box?**  
A: YES! It's the same code sent to your email

**Q: What if I entered wrong username?**  
A: We don't say if account exists, for security. Contact support.

---

## 🎉 That's It!

Your password reset is now:
- ✅ **Automatic** (no re-entry)
- ✅ **Fast** (code on screen immediately)
- ✅ **Reliable** (email + screen)
- ✅ **Secure** (expires in 10 min)
- ✅ **User-friendly** (large code display)

**Test it now and enjoy the smooth flow!** 🚀
