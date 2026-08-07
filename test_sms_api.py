"""
MedSense — Test TextBee SMS API and check all medicine reminders.
Run: python test_sms_api.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medsense_backend.settings')
django.setup()

import requests
from django.conf import settings
from django.contrib.auth.models import User
from api.models import MedicineReminder, UserProfile

print("=" * 60)
print("  MedSense — SMS & Medicine Reminder Check")
print("=" * 60)

# ── 1. Check TextBee config ───────────────────────────────────────
tb_key = getattr(settings, 'TEXTBEE_API_KEY', '')
tb_dev = getattr(settings, 'TEXTBEE_DEVICE_ID', '')
f2s_key = getattr(settings, 'FAST2SMS_API_KEY', '')

print(f"\n[Config]")
print(f"  TextBee API Key : {'SET (' + tb_key[:10] + '...)' if tb_key else 'NOT SET'}")
print(f"  TextBee Device  : {'SET (' + tb_dev + ')' if tb_dev else 'NOT SET'}")
print(f"  Fast2SMS Key    : {'SET (' + f2s_key[:10] + '...)' if f2s_key else 'NOT SET'}")

# ── 2. Check TextBee device status ────────────────────────────────
if tb_key and tb_dev:
    print(f"\n[TextBee] Checking device status...")
    try:
        r = requests.get(
            f'https://api.textbee.dev/api/v1/gateway/devices/{tb_dev}',
            headers={'x-api-key': tb_key},
            timeout=10
        )
        print(f"  Status code : {r.status_code}")
        print(f"  Response    : {r.text[:300]}")
    except Exception as e:
        print(f"  [ERROR] {e}")

# ── 3. List all medicine reminders ───────────────────────────────
print(f"\n[Medicine Reminders] All reminders in DB:")
reminders = MedicineReminder.objects.all().select_related('user__profile')
if not reminders.exists():
    print("  No medicine reminders found.")
else:
    for r in reminders:
        profile = getattr(r.user, 'profile', None)
        phone = profile.phone if profile else 'N/A'
        print(f"  ID:{r.id} | {r.user.username} | {r.medicine_name} | "
              f"Time:{r.reminder_time} | Status:{r.status} | "
              f"SMS sent:{r.sms_sent} | Phone:{phone} | Email:{r.user.email}")

# ── 4. List users with/without phone numbers ─────────────────────
print(f"\n[Users] Phone number status:")
for user in User.objects.all():
    profile = getattr(user, 'profile', None)
    phone = profile.phone if profile else 'NO PROFILE'
    email = user.email or 'NO EMAIL'
    print(f"  {user.username}: phone={phone or 'EMPTY'}, email={email}")

# ── 5. Trigger the scheduler job manually ────────────────────────
print(f"\n[Scheduler] Manually triggering _check_medicine_reminders()...")
from api.scheduler import _check_medicine_reminders
try:
    _check_medicine_reminders()
    print("  [OK] Scheduler job ran without errors.")
except Exception as e:
    print(f"  [ERROR] {e}")

print("\n" + "=" * 60)
print("  Done.")
print("=" * 60)
