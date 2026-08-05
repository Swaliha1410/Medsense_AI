from django.contrib.auth.models import User
from rest_framework import serializers
import phonenumbers
from .models import (
    UserProfile, ChatMessage, HealthScore,
    MedicineReminder, MedicalReport, HospitalSearch, ContactInquiry
)


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')
    email     = serializers.EmailField(required=True)
    phone     = serializers.CharField(max_length=20, required=False, allow_blank=True, write_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2', 'phone']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_phone(self, value):
        """Validate phone number format using phonenumbers library."""
        if not value:  # Phone is optional
            return value
        
        try:
            # Try to parse the phone number with a default region (US)
            parsed = phonenumbers.parse(value, 'US')
            if not phonenumbers.is_valid_number(parsed):
                raise serializers.ValidationError('Invalid phone number format.')
            return value
        except phonenumbers.NumberParseException as e:
            raise serializers.ValidationError(f'Invalid phone number: {str(e)}')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        phone_country = ''
        
        # Extract country from phone number if provided
        if phone:
            try:
                parsed = phonenumbers.parse(phone, 'US')
                # Get the country name from the country code
                country_code = phonenumbers.region_code_for_number(parsed)
                if country_code:
                    import phonenumbers.geocoder
                    phone_country = phonenumbers.geocoder.description_for_number(parsed, 'en')
            except:
                pass  # If extraction fails, just save the phone without country
        
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, phone=phone, phone_country=phone_country)
        return user

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, phone=phone)
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
            'id', 'user', 'phone', 'phone_country', 'carrier_gateway',
            'date_of_birth', 'blood_group', 'allergies',
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
