"""
MedSense — Manually trigger medicine reminders for ALL pending medicines
regardless of time (force-send). Used for testing.
Run: python trigger_reminders.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medsense_backend.settings')
django.setup()

import requests
from django.conf import settings
from django.utils import timezone
from api.models import MedicineReminder
from api.scheduler import _send_reminder

print("=" * 60)
print("  MedSense — Force-Send All Pending Medicine Reminders")
print("=" * 60)

tb_key = settings.TEXTBEE_API_KEY
tb_dev = settings.TEXTBEE_DEVICE_ID

reminders = MedicineReminder.objects.filter(status='pending').select_related('user__profile')

if not reminders.exists():
    print("\n No pending medicine reminders found in DB.")
else:
    print(f"\n Found {reminders.count()} pending reminder(s):\n")
    sent, failed = 0, 0
    now_utc = timezone.now()

    for r in reminders:
        user = r.user
        name = user.first_name or user.username
        profile = getattr(user, 'profile', None)
        phone = profile.phone.strip() if profile and profile.phone else ''
        due = r.reminder_time.strftime('%I:%M %p')
        dose = f' ({r.dosage})' if r.dosage else ''

        print(f"  -> {user.username} | {r.medicine_name}{dose} | due {due}")
        print(f"     phone={phone or 'NONE'} | email={user.email or 'NONE'}")

        ok = _send_reminder(user, r.medicine_name, r.dosage, due, is_repeat=False)

        # Mark SMS as sent
        r.sms_sent = True
        r.last_sms_at = now_utc
        r.save(update_fields=['sms_sent', 'last_sms_at'])

        sent += 1
        print(f"     [OK] Reminder sent\n")

    print("=" * 60)
    print(f"  Processed : {sent} reminder(s)")
    print(f"  Failed    : {failed}")
    print("=" * 60)
