"""
MedSense — Send test notification email to all registered users.
Run: python send_all_emails.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medsense_backend.settings')
django.setup()

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth.models import User
import uuid
from email.utils import formatdate

users_with_email = User.objects.exclude(email='').values('id', 'username', 'email', 'first_name')
print(f'Sending to users with emails...\n')

sent_emails = set()
success, failed = 0, 0

for u in users_with_email:
    email = u['email']
    if email in sent_emails:
        print(f'[SKIP] Duplicate email {email} for user {u["username"]}')
        continue
    sent_emails.add(email)

    name = u['first_name'] or u['username']

    html_body = """<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f6f9;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0F6FFF,#14C8A8);
                       padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">
                Med<span style="color:#d0f5ef;">Sense</span>
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                AI-Powered Health Companion
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#0f172a;font-size:16px;">Hello <strong>""" + name + """</strong>,</p>
              <p style="color:#475569;font-size:14px;line-height:1.7;">
                This is a notification from <strong>MedSense</strong>. Your account is active and working correctly.
              </p>
              <p style="color:#475569;font-size:14px;line-height:1.7;">
                MedSense will send you <strong>daily medicine reminders</strong> to help you
                stay on track with your medication schedule. Make sure your medicine
                reminders are set up in the app.
              </p>
              <div style="background:#eff6ff;border-radius:8px;padding:20px;margin:24px 0;">
                <p style="margin:0;color:#1d4ed8;font-size:14px;font-weight:600;">
                  Your Health is Our Priority
                </p>
                <p style="margin:8px 0 0;color:#3b82f6;font-size:13px;">
                  Log in to MedSense to manage your medicines and health data.
                </p>
              </div>
              <p style="color:#94a3b8;font-size:12px;">
                If you did not create a MedSense account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;
                       border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                2026 MedSense | AI-Powered Health Companion
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_body = (
        f'Hello {name},\n\n'
        f'This is a notification from MedSense. Your account is active and working correctly.\n\n'
        f'MedSense will send you daily medicine reminders to help you stay on track.\n'
        f'Log in to manage your medicines and health data.\n\n'
        f'If you did not create a MedSense account, please ignore this email.\n\n'
        f'-- The MedSense Team'
    )

    try:
        msg = EmailMultiAlternatives(
            subject='MedSense — Your Account Notification',
            body=text_body,
            from_email=f'MedSense <{settings.EMAIL_HOST_USER}>',
            to=[f'{name} <{email}>'],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.extra_headers = {
            'Message-ID': f'<notify-{uuid.uuid4().hex}@medsense.app>',
            'Date': formatdate(localtime=True),
            'Precedence': 'transactional',
        }
        msg.send(fail_silently=False)
        print(f'[OK]   Email sent -> {email} (user: {u["username"]})')
        success += 1
    except Exception as e:
        print(f'[FAIL] {email} (user: {u["username"]}): {e}')
        failed += 1

print(f'\n--- Email Summary ---')
print(f'Sent:          {success}')
print(f'Failed:        {failed}')
print(f'Unique emails: {len(sent_emails)}')
