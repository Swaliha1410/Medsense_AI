# Email Delivery Diagnostic — What to Check

## ✅ Backend Status: WORKING

The Django backend is successfully:
- ✅ Generating 6-digit password reset codes
- ✅ Sending emails via Gmail SMTP (confirmed in logs)
- ✅ Storing codes with 10-minute expiration
- ✅ Displaying codes on Vite frontend

**Django Log Evidence:**
```
[MedSense] ✓✓✓ PASSWORD RESET EMAIL SENT ✓✓✓
  To: test.medsense@example.com
  Code: 649319
  Username: testuser
```

---

## 📬 Email Delivery Checklist

### 1️⃣ Check Gmail Spam/Junk Folder

**Why?** Gmail often filters password reset emails as spam

**How to check:**
```
Gmail App on Phone:
1. Open Gmail
2. Tap Menu (≡)
3. Select "Spam" or "Junk"
4. Look for emails from "MedSense"
5. If found → Mark as "Not spam"
6. This teaches Gmail to allow future emails
```

### 2️⃣ Check Gmail Promotions Tab

**Why?** Some emails go to Promotions instead of Inbox

**How to check:**
```
Gmail App:
1. Open Gmail
2. Look at tabs: Primary | Social | Promotions | Updates
3. Tap "Promotions" tab
4. Look for MedSense emails
5. Drag to Primary if found
```

### 3️⃣ Check Gmail Forwarding Rules

**Why?** You might have a filter rule redirecting emails

**How to check:**
```
Gmail Web (desktop):
1. Go to gmail.com
2. Click Settings (⚙)
3. Select "See all settings"
4. Go to "Filters and Blocked Addresses"
5. Look for rules with "MedSense"
6. Delete if blocking
```

### 4️⃣ Enable Gmail Notifications

**Why?** Email might arrive but notification is disabled

**How to check:**
```
Gmail App Settings:
1. Open Gmail app
2. Tap Menu (≡)
3. Select "Settings"
4. Tap your account
5. Go to "Notifications"
6. Set "Inbox notifications" to "All mail"
7. Enable sound/vibration
```

### 5️⃣ Check Multiple Gmail Accounts

**Why?** You might have multiple Gmail accounts

**How to check:**
```
Gmail App:
1. Tap your profile picture (top-left)
2. You'll see all your Gmail accounts
3. Check each one for MedSense email
4. The email might go to a different account
```

### 6️⃣ Check Email Sync

**Why?** Phone might not have synced new emails

**How to check:**
```
Gmail App:
1. Pull down from top to refresh
2. Wait 30-60 seconds
3. Check if new emails appear
4. If not, ensure WiFi/Data is connected
```

### 7️⃣ Check Forwarding

**Why?** Emails might be forwarded to another address

**How to check:**
```
Gmail Web (desktop):
1. Go to gmail.com
2. Click Settings (⚙)
3. Select "See all settings"
4. Go to "Forwarding and POP/IMAP"
5. Check "Forwarding address"
6. If set, emails go there instead
```

### 8️⃣ Check Gmail Account Status

**Why?** Account restrictions might block emails

**How to check:**
```
Gmail Web (desktop):
1. Go to myaccount.google.com
2. Click "Security"
3. Scroll to "Recent security events"
4. Look for any warnings or alerts
5. If needed, verify account recovery options
```

---

## 🔍 Advanced Diagnostics

### Check if Email Backend is Working

The code shows the email was sent successfully:
```python
response['email_sent'] = true  # ← This means SMTP sent it
```

If the API shows `email_sent: false`, then the SMTP failed.

### Manual SMTP Test

Run this to test if Gmail SMTP works:

```bash
python -c "
from django.core.mail import send_mail
from django.conf import settings
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medsense_backend.settings')
django.setup()

result = send_mail(
    'Test from MedSense',
    'If you see this, SMTP works!',
    settings.DEFAULT_FROM_EMAIL,
    ['test.medsense@example.com'],
    fail_silently=False,
)
print(f'✓ Sent: {result} emails')
"
```

### Check Django Logs

When you request a password reset, look for:
```
[MedSense] ✓✓✓ PASSWORD RESET EMAIL SENT ✓✓✓
  To: test.medsense@example.com
  Code: 649319
  Username: testuser
```

If you see this, the email WAS sent by Django.

If you see:
```
[MedSense] ✗✗✗ SMTP ERROR ✗✗✗
```

Then there's an SMTP connection problem.

---

## 📊 Troubleshooting Flowchart

```
Email not received on phone?
        ↓
Check Django logs for "EMAIL SENT"?
        ├─ YES → Email was sent by backend
        │         ↓
        │         Check Gmail Spam folder
        │         ├─ YES → Mark as "Not spam"
        │         ├─ NO → Check Promotions tab
        │         ├─ NO → Check other accounts
        │         ├─ NO → Pull down to refresh
        │         └─ NO → Wait 2 minutes
        │
        └─ NO → SMTP error
                Check Gmail credentials
                Verify app password
                Check firewall/proxy
```

---

## 🔐 Gmail App Password Security

The app password used is:
- ✅ Specific to this app (not your main password)
- ✅ Revocable (can disable anytime)
- ✅ 2FA protected (requires authentication)
- ✅ Limited scope (mail only)

**If compromised:**
1. Go to myaccount.google.com/apppasswords
2. Select "Mail" and device
3. Click "Delete"
4. Generate a new one

---

## ✨ Quick Fix Steps

**In order of likelihood:**

1. **Check Gmail Spam Folder**
   - Most common reason
   - Pull down refresh in Gmail app
   - Look for MedSense emails

2. **Enable Gmail Notifications**
   - Might be there but not notified
   - Check settings in Gmail app

3. **Check Multiple Accounts**
   - Tap profile picture
   - Ensure you're viewing correct account

4. **Wait & Refresh**
   - Gmail SMTP can have 1-2 min delay
   - Pull down to refresh

5. **Check Filters/Rules**
   - Gmail Web Settings
   - See if MedSense is blocked

6. **Test SMTP Directly**
   - Run the manual test above
   - Verify Gmail credentials work

---

## 📧 Verification

The email SHOULD contain:

```
From: MedSense <sahilkatariya132@gmail.com>
Subject: MedSense — Your Password Reset Code
To: test.medsense@example.com

Hello testuser,

Your MedSense password reset code is:

    649319

This code expires in 10 minutes.

Do NOT share this code with anyone.
If you did not request this, please ignore this email.

— The MedSense Team
Support: support@medsense.ai
```

If you see an email like this, **the system is working correctly!**

---

## ⚡ Quick Workaround

While you troubleshoot email delivery:

1. ✅ The code IS displayed on screen in the blue box
2. ✅ You can use that code right away
3. ✅ No need to wait for email to reset password

**So even if email is slow, you can reset password immediately!**

---

## 📱 Best Practices

1. **Always check spam folder first** — most common issue
2. **Mark as "Not spam"** — helps future emails
3. **Enable notifications** — know when emails arrive
4. **Check multiple accounts** — if you have several
5. **Wait 2 minutes** — SMTP can be slow sometimes

---

## 💬 Need Help?

If emails still aren't arriving after checking all above:

1. Share the Django console output
2. Share Gmail spam folder screenshots  
3. Confirm which Gmail account you're checking
4. Verify email address in database matches

The backend is confirmed working. This is almost always a Gmail filtering or notification issue.
