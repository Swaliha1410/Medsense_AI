from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    UserProfile, ChatMessage, HealthScore,
    MedicineReminder, MedicalReport, HospitalSearch, ContactInquiry
)


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# ── UserProfile ───────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'phone', 'date_of_birth', 'blood_group', 'allergies',
            'gender', 'height', 'weight', 'emergency_contact', 'emergency_phone',
            'created_at', 'updated_at',
        ]


# ── ChatMessage ───────────────────────────────────────────────────────────────

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp']
        read_only_fields = ['timestamp']


# ── HealthScore ───────────────────────────────────────────────────────────────

class HealthScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthScore
        fields = ['id', 'score', 'notes', 'recorded_at']
        read_only_fields = ['recorded_at']

    def validate_score(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError('Score must be between 0 and 100.')
        return value


# ── MedicineReminder ──────────────────────────────────────────────────────────

class MedicineReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineReminder
        fields = [
            'id', 'medicine_name', 'dosage', 'frequency',
            'reminder_time', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


# ── MedicalReport ─────────────────────────────────────────────────────────────

class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = ['id', 'title', 'file', 'file_type', 'ai_summary', 'uploaded_at']
        read_only_fields = ['uploaded_at', 'ai_summary']


# ── HospitalSearch ────────────────────────────────────────────────────────────

class HospitalSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalSearch
        fields = ['id', 'query', 'latitude', 'longitude', 'results_count', 'searched_at']
        read_only_fields = ['searched_at']


# ── ContactInquiry ────────────────────────────────────────────────────────────

class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'message', 'submitted_at']
        read_only_fields = ['submitted_at']
