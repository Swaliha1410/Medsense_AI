from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user              = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone             = models.CharField(max_length=20, blank=True)
    date_of_birth     = models.DateField(null=True, blank=True)
    blood_group       = models.CharField(max_length=5, blank=True)
    allergies         = models.TextField(blank=True)
    gender            = models.CharField(max_length=30, blank=True)
    height            = models.FloatField(null=True, blank=True)   # cm
    weight            = models.FloatField(null=True, blank=True)   # kg
    emergency_contact = models.CharField(max_length=150, blank=True)
    emergency_phone   = models.CharField(max_length=20, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.user.username} [{self.role}] - {self.timestamp:%Y-%m-%d %H:%M}"


class HealthScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_scores')
    score = models.PositiveSmallIntegerField()          # 0–100
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.user.username} - {self.score}/100"


class MedicineReminder(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('twice_daily', 'Twice Daily'),
        ('weekly', 'Weekly'),
        ('as_needed', 'As Needed'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('taken', 'Taken'),
        ('missed', 'Missed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medicine_reminders')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    reminder_time = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reminder_time']

    def __str__(self):
        return f"{self.user.username} - {self.medicine_name} ({self.status})"


class MedicalReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medical_reports')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='medical_reports/%Y/%m/')
    file_type = models.CharField(max_length=50, blank=True)   # e.g. PDF, JPG
    ai_summary = models.TextField(blank=True)                 # AI-generated summary
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class HospitalSearch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hospital_searches')
    query = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    results_count = models.PositiveIntegerField(default=0)
    searched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-searched_at']

    def __str__(self):
        return f"{self.user.username} - '{self.query}' ({self.results_count} results)"


class ContactInquiry(models.Model):
    """Stores messages submitted via the CTA / contact form."""
    name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name_plural = 'Contact Inquiries'

    def __str__(self):
        return f"{self.name} <{self.email}>"
