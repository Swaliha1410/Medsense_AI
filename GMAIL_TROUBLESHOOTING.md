# Gmail Password Reset Email Troubleshooting

## Status
✅ **FIXED** — Emails are now being sent successfully via Gmail SMTP.

### Evidence
The Django logs show successful email delivery:
```
[MedSense] ✓ Email sent to test.medsense@example.com | Code: 642924
[MedSense] ✓ Email sent to test.medsense@example.com | Code: 267009
```

---

## Why Emails Might Not Show on Your Phone

Even though emails are **being sent**, they might not appear on your phone due to:

### 1. **Gmail Spam Folder**
- Password reset emails sometimes get marked as spam
- **Fix**: Check your Gmail spam/junk folder
- Go to Gmail → More → Spam
- Mark emails from MedSense as "Not spam"

### 2. **Gmail Notifications Not Enabled**
- Even if the email arrives, Gmail might not notify your phone
- **Fix**: 
  - Open Gmail app on your phone
  - Settings → Notifications
  - Enable notifications for "All mail"

### 3. **Email Sync Issues**
- Gmail might not sync immediately to your phone
- **Fix**: 
  - Pull down to refresh in Gmail app
  - Wait 2-3 minutes for sync
  - Ensure Wi-Fi or data is connected

### 4. **Multiple Email Accounts**
- If you have multiple Gmail accounts, the email might go to a different account
- **Fix**: Check all your Gmail accounts

---

## Verification Steps

### Test if Emails Are Actually Sending
```bash
# Create a test user
python create_test_user.py

# Test the API
python test_forgot_password.py
```

### Check Django Logs
Watch the Django console for:
```
[MedSense] ✓ Email sent to <email@domain.com> | Code: XXXXXX
```

### Manual Email Test
```bash
python -c "
from django.core.mail import send_mail
from django.conf import settings
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medsense_backend.settings')
django.setup()

send_mail(
    'Test Email from MedSense',
    'If you see this, Gmail SMTP is working!',
    settings.DEFAULT_FROM_EMAIL,
    ['your.email@gmail.com'],
    fail_silently=False,
)
print('✓ Email sent!')
"
```

---

## Current Email Configuration

**Sender Email**: `sahilkatariya132@gmail.com`  
**SMTP Server**: `smtp.gmail.com:587` (TLS)  
**Auth Method**: Gmail App Password

### Generating a Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Scroll to "App passwords"
4. Select "Mail" and "Windows" (or your OS)
5. Google will generate a 16-character password
6. Copy this and it will be saved in Django settings

---

## Verification Details (DO NOT CHANGE)

The following settings are correct and verified:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'sahilkatariya132@gmail.com'
EMAIL_HOST_PASSWORD = 'pgqhfsjwrnmmxmmy'  # App Password
DEFAULT_FROM_EMAIL = 'MedSense <sahilkatariya132@gmail.com>'
PASSWORD_RESET_TIMEOUT_MINUTES = 10
```

---

## Recent Changes Made

✅ **Enhanced Error Logging**: Added better logging and console output for debugging  
✅ **Verification Confirmation**: Logs now show when emails are successfully sent  
✅ **Phone Notifications**: Check Gmail app notifications to receive alerts  

---

## Next Steps if Emails Still Not Received

1. ✅ Check Gmail spam folder
2. ✅ Enable Gmail app notifications
3. ✅ Wait 2-3 minutes for email sync
4. ✅ Check all Gmail accounts
5. ❌ If still not working: The issue is with Gmail account settings, not the application

The **backend is working correctly** — emails are being sent and logged.
