"""
MedSense — Medicine Reminder SMS via Fast2SMS
=============================================
Uses Fast2SMS REST API (fast2sms.com) — free Indian SMS service.
No carrier gateway needed. Works directly with any Indian mobile number.

Set FAST2SMS_API_KEY in settings.py to activate.
"""

import logging
import requests as http_requests
from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings

logger = logging.getLogger(__name__)


# ── Fast2SMS sender ───────────────────────────────────────────────────────────

def _send_reminder(user, medicine_name: str, dosage: str, due_time: str, is_repeat: bool) -> bool:
    """
    Send a medicine reminder via TextBee SMS (primary) → email fallback.
    """
    name  = user.first_name or user.username
    dose  = f' ({dosage})' if dosage else ''
    tag   = 'REMINDER: ' if is_repeat else ''
    message = (
        f'{tag}MedSense: Hi {name}, your {due_time} dose of '
        f'{medicine_name}{dose} is overdue. '
        f'Open MedSense to mark it taken or missed.'
    )

    # ── Primary: TextBee SMS ─────────────────────────────────────────────────
    profile  = getattr(user, 'profile', None)
    phone    = profile.phone.strip() if profile and profile.phone else ''
    tb_key   = getattr(settings, 'TEXTBEE_API_KEY',   '')
    tb_dev   = getattr(settings, 'TEXTBEE_DEVICE_ID', '')

    if phone and tb_key and tb_dev:
        p = phone.replace(' ', '').replace('-', '')
        if not p.startswith('+'):
            p = f'+91{p.lstrip("91")}' if p.startswith('91') else f'+91{p}'
        try:
            r = http_requests.post(
                f'https://api.textbee.dev/api/v1/gateway/devices/{tb_dev}/sendSMS',
                headers={'x-api-key': tb_key, 'Content-Type': 'application/json'},
                json={'receivers': [p], 'message': message},
                timeout=15,
            )
            data = r.json()
            if r.status_code in (200, 201) and data.get('data', {}).get('success'):
                logger.info(f'[MedSense] ✓ SMS sent to {p} | {medicine_name}')
                print(f'[MedSense] [OK] SMS sent to {p} | {medicine_name}')
            else:
                print(f'[MedSense] TextBee failed: {data} - trying email...')
        except Exception as exc:
            print(f'[MedSense] TextBee error: {exc} - trying email...')

    # ── Fallback: Email ──────────────────────────────────────────────────────
    if user.email:
        from django.core.mail import send_mail
        try:
            send_mail(
                subject=f'⏰ {"Reminder: " if is_repeat else "Take "}{medicine_name}{dose} — MedSense',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f'[MedSense] [OK] Fallback email sent -> {user.email}')
            return True
        except Exception as exc:
            print(f'[MedSense] Email fallback failed: {exc}')

    print(f'[MedSense] [FAIL] All methods failed for {user.username}')
    return False


# ── Scheduler job ─────────────────────────────────────────────────────────────

def _reset_daily_medicines():
    """
    Called once per day at midnight UTC.
    Resets 'taken' and 'missed' medicines back to 'pending' for daily/twice_daily/as_needed
    so they appear in the Today panel the next day.
    Weekly medicines are reset only on their scheduled day of the week.
    """
    from api.models import MedicineReminder
    from datetime import date

    today_dow = date.today().weekday()  # Mon=0 … Sun=6

    # Reset daily and twice_daily
    daily_reset = MedicineReminder.objects.filter(
        frequency__in=['daily', 'twice_daily', 'as_needed'],
        status__in=['taken', 'missed'],
    )
    count_daily = daily_reset.update(status='pending', sms_sent=False, last_sms_at=None)

    # Reset weekly — only those created on the same day of week as today
    weekly_reset = MedicineReminder.objects.filter(
        frequency='weekly',
        status__in=['taken', 'missed'],
    )
    weekly_count = 0
    for med in weekly_reset:
        if med.created_at.weekday() == today_dow:
            med.status      = 'pending'
            med.sms_sent    = False
            med.last_sms_at = None
            med.save(update_fields=['status', 'sms_sent', 'last_sms_at'])
            weekly_count += 1

    total = count_daily + weekly_count
    if total:
        print(f'[MedSense] Daily reset: {total} medicine(s) reset to pending.')
        logger.info(f'[MedSense] Daily reset: {total} medicine(s) reset to pending.')


def _check_medicine_reminders():
    """
    Called every 60 seconds.
    Finds pending medicines whose reminder_time has passed the grace period.
    Sends an SMS immediately on first overdue detection, then REPEATS every
    15 minutes until the user marks the medicine as taken or missed.
    """
    from api.models import MedicineReminder
    from django.utils import timezone as tz

    grace        = int(getattr(settings, 'MEDICINE_SMS_GRACE_MINUTES', 5))
    repeat_mins  = int(getattr(settings, 'MEDICINE_SMS_REPEAT_MINUTES', 15))
    now_utc      = tz.now()
    now_local    = datetime.now()
    cutoff       = (now_local - timedelta(minutes=grace)).time()

    overdue = (
        MedicineReminder.objects
        .filter(status='pending', reminder_time__lte=cutoff)
        .select_related('user__profile')
    )

    for reminder in overdue:
        # Decide whether to send SMS now
        if reminder.last_sms_at is not None:
            elapsed = (now_utc - reminder.last_sms_at).total_seconds() / 60
            if elapsed < repeat_mins:
                continue

        user    = reminder.user
        profile = getattr(user, 'profile', None)
        phone   = profile.phone.strip() if profile and profile.phone else ''

        if not phone and not user.email:
            if not reminder.sms_sent:
                print(f'[MedSense] Skipping {user.username}/{reminder.medicine_name} — no phone or email in profile.')
                reminder.sms_sent   = True
                reminder.last_sms_at = now_utc
                reminder.save(update_fields=['sms_sent', 'last_sms_at'])
            continue

        name = user.first_name or user.username
        dose = f' ({reminder.dosage})' if reminder.dosage else ''
        due  = reminder.reminder_time.strftime('%I:%M %p')
        is_repeat = reminder.last_sms_at is not None

        tag = 'REPEAT' if is_repeat else 'FIRST'
        print(
            f'\n[MedSense] [{tag}] Sending reminder to {user.email or phone}'
            f'\n  Medicine: {reminder.medicine_name}{dose}  Due: {due}\n'
        )

        _send_reminder(user, reminder.medicine_name, reminder.dosage, due, is_repeat)

        reminder.sms_sent   = True
        reminder.last_sms_at = now_utc
        reminder.save(update_fields=['sms_sent', 'last_sms_at'])


# ── Scheduler singleton ───────────────────────────────────────────────────────

_scheduler: BackgroundScheduler | None = None


def start():
    """Start the APScheduler background thread. Safe to call multiple times."""
    global _scheduler

    if _scheduler is not None and _scheduler.running:
        return

    _scheduler = BackgroundScheduler(timezone='UTC')
    _scheduler.add_job(
        _check_medicine_reminders,
        trigger=IntervalTrigger(seconds=60),
        id='medicine_reminder_check',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    # Reset daily medicines to pending every day at midnight UTC
    from apscheduler.triggers.cron import CronTrigger
    _scheduler.add_job(
        _reset_daily_medicines,
        trigger=CronTrigger(hour=0, minute=0),
        id='medicine_daily_reset',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    _scheduler.start()
    logger.info('[MedSense SMS] Scheduler started — checking medicines every 60 s.')
    print('[MedSense SMS] Scheduler started - checking medicines every 60 s.')


def stop():
    """Gracefully shut down the scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info('[MedSense SMS] Scheduler stopped.')
