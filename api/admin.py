from django.contrib import admin
from .models import (
    UserProfile, ChatMessage, HealthScore,
    MedicineReminder, MedicalReport, HospitalSearch, ContactInquiry
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'blood_group', 'created_at']
    search_fields = ['user__username', 'user__email']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'timestamp']
    list_filter = ['role']
    search_fields = ['user__username', 'content']


@admin.register(HealthScore)
class HealthScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'recorded_at']
    list_filter = ['score']
    search_fields = ['user__username']


@admin.register(MedicineReminder)
class MedicineReminderAdmin(admin.ModelAdmin):
    list_display = ['user', 'medicine_name', 'frequency', 'status', 'reminder_time']
    list_filter = ['status', 'frequency']
    search_fields = ['user__username', 'medicine_name']


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'file_type', 'uploaded_at']
    list_filter = ['file_type']
    search_fields = ['user__username', 'title']


@admin.register(HospitalSearch)
class HospitalSearchAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'results_count', 'searched_at']
    search_fields = ['user__username', 'query']


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'submitted_at']
    search_fields = ['name', 'email']
