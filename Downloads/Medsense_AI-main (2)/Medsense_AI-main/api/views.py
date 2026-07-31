from django.contrib.auth.models import User
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings as django_settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone

from .models import (
    UserProfile, ChatMessage, HealthScore,
    MedicineReminder, MedicalReport, HospitalSearch, ContactInquiry
)
from .serializers import (
    RegisterSerializer, UserSerializer, UserProfileSerializer,
    ChatMessageSerializer, HealthScoreSerializer, MedicineReminderSerializer,
    MedicalReportSerializer, HospitalSearchSerializer, ContactInquirySerializer
)


# ── Auth Views ────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/  — create a new user account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """POST /api/auth/login/  — return auth token."""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data})


@api_view(['POST'])
def logout_view(request):
    """POST /api/auth/logout/  — delete token."""
    request.user.auth_token.delete()
    return Response({'detail': 'Logged out successfully.'})


@api_view(['GET'])
def me_view(request):
    """GET /api/auth/me/  — return current user info."""
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_auth(request):
    """
    POST /api/auth/google/  — authenticate with Google OAuth
    
    Expected payload:
    {
        "credential": "eyJhbGciOiJS... (JWT token from Google)"
    }
    
    Returns:
    {
        "token": "abc123...",
        "user": {
            "id": 1,
            "username": "user@gmail.com",
            "email": "user@gmail.com",
            "first_name": "John",
            "last_name": "Doe"
        },
        "created": true  // true if user was newly created
    }
    """
    credential = request.data.get('credential')
    
    if not credential:
        return Response(
            {'error': 'Google credential is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify the Google token
        # Replace with your actual Google Client ID
        GOOGLE_CLIENT_ID = '321069766069-rsddojrcptcb0n22osr4hk236drromdb.apps.googleusercontent.com'
        
        idinfo = id_token.verify_oauth2_token(
            credential, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Extract user information from Google
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        google_id = idinfo.get('sub')
        picture = idinfo.get('picture', '')
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,  # Use email as username
                'first_name': first_name,
                'last_name': last_name,
            }
        )
        
        # Update user info if already exists (in case they changed their name)
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        
        # Get or create user profile and store Google ID
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.profile_picture and picture:
            # You can optionally download and save the Google profile picture
            # For now, we'll just store the URL
            pass
        
        # Generate or get auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'created': created,  # Tells frontend if this is a new user
            'google_picture': picture,  # Send Google profile picture URL
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        # Invalid token
        return Response(
            {'error': f'Invalid Google token: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Other errors
        return Response(
            {'error': f'Authentication failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ── UserProfile ───────────────────────────────────────────────────────────────

class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/profile/"""
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


# ── ChatMessage ───────────────────────────────────────────────────────────────

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    GET    /api/chat/        — list all messages for the current user
    POST   /api/chat/        — save a new message
    DELETE /api/chat/{id}/   — delete a message
    """
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        return ChatMessage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── HealthScore ───────────────────────────────────────────────────────────────

class HealthScoreViewSet(viewsets.ModelViewSet):
    """
    GET  /api/health-scores/      — list scores (most recent first)
    POST /api/health-scores/      — record a new score
    """
    serializer_class = HealthScoreSerializer

    def get_queryset(self):
        return HealthScore.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
def latest_health_score(request):
    """GET /api/health-scores/latest/  — single most-recent score."""
    score = HealthScore.objects.filter(user=request.user).first()
    if not score:
        return Response({'detail': 'No health score recorded yet.'}, status=404)
    return Response(HealthScoreSerializer(score).data)


# ── MedicineReminder ──────────────────────────────────────────────────────────

class MedicineReminderViewSet(viewsets.ModelViewSet):
    """Full CRUD for medicine reminders."""
    serializer_class = MedicineReminderSerializer

    def get_queryset(self):
        qs = MedicineReminder.objects.filter(user=self.request.user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── MedicalReport ─────────────────────────────────────────────────────────────

class MedicalReportViewSet(viewsets.ModelViewSet):
    """Full CRUD for medical reports (file upload supported)."""
    serializer_class = MedicalReportSerializer

    def get_queryset(self):
        return MedicalReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        file_type = ''
        if file:
            name = file.name.upper()
            if name.endswith('.PDF'):
                file_type = 'PDF'
            elif name.endswith(('.JPG', '.JPEG')):
                file_type = 'JPG'
            elif name.endswith('.PNG'):
                file_type = 'PNG'
        serializer.save(user=self.request.user, file_type=file_type)


# ── HospitalSearch ────────────────────────────────────────────────────────────

class HospitalSearchViewSet(viewsets.ModelViewSet):
    """Stores hospital search queries and results counts."""
    serializer_class = HospitalSearchSerializer
    http_method_names = ['get', 'post', 'delete']   # no partial edits needed

    def get_queryset(self):
        return HospitalSearch.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── ContactInquiry ────────────────────────────────────────────────────────────

class ContactInquiryCreateView(generics.CreateAPIView):
    """POST /api/contact/  — anyone can submit (no login required)."""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.AllowAny]


# ── Password Reset ────────────────────────────────────────────────────────────

# In-memory store: { email: { code, expires_at } }
# Fine for a single-process dev server. For production use Django cache or a DB model.
_reset_codes: dict = {}


def _generate_code(length: int = 6) -> str:
    """Return a random numeric OTP of the given length."""
    return ''.join(random.choices(string.digits, k=length))


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code(request):
    """
    POST /api/auth/verify-reset-code/
    Body: { "email": "user@example.com", "code": "123456" }

    Validates the OTP without consuming it.
    Returns 200 on match, 400 on wrong/expired code.
    """
    email = request.data.get('email', '').strip().lower()
    code  = request.data.get('code', '').strip()

    if not email or not code:
        return Response({'error': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    entry = _reset_codes.get(email)
    if not entry:
        return Response({'error': 'No reset code found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > entry['expires_at']:
        _reset_codes.pop(email, None)
        return Response({'error': 'Reset code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    if entry['code'] != code:
        return Response({'error': 'Incorrect code. Please check your email and try again.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'detail': 'Code verified.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }   (also accepts username)

    Generates a 6-digit OTP, stores it server-side (expires in 10 min),
    and sends it to the user's registered email via SMTP.
    """
    identifier = request.data.get('email', '').strip()

    if not identifier:
        return Response(
            {'error': 'Email or username is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Resolve the User — match by email or username
    # Use filter().first() to safely handle duplicate emails
    user = (
        User.objects.filter(email__iexact=identifier).first() or
        User.objects.filter(username__iexact=identifier).first()
    )

    if user and user.email:
        code = _generate_code()
        timeout = int(getattr(django_settings, 'PASSWORD_RESET_TIMEOUT_MINUTES', 10))
        expires_at = timezone.now() + timedelta(minutes=timeout)

        # Store against the actual email so reset_password can look it up
        _reset_codes[user.email.lower()] = {'code': code, 'expires_at': expires_at}

        try:
            send_mail(
                subject='MedSense — Your Password Reset Code',
                message=(
                    f'Hello {user.username},\n\n'
                    f'Your MedSense password reset code is:\n\n'
                    f'    {code}\n\n'
                    f'This code expires in {timeout} minutes.\n'
                    f'If you did not request this, please ignore this email.\n\n'
                    f'— The MedSense Team'
                ),
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f'[MedSense] Reset code sent to {user.email}')
        except Exception as exc:
            print(f'[MedSense] SMTP error for {user.email}: {exc}')
            return Response(
                {'error': f'Failed to send email: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        # Return the email so the frontend can pre-fill the next step
        return Response(
            {
                'detail': 'A reset code has been sent to your email.',
                'email': user.email,   # front-end uses this for the verify step
            },
            status=status.HTTP_200_OK
        )

    elif user and not user.email:
        return Response(
            {'error': 'No email address is linked to this account. Please contact support.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    else:
        # Don't reveal whether the account exists
        return Response(
            {'detail': 'If that email or username is registered, a reset code has been sent.'},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """
    POST /api/auth/reset-password/
    Body: { "email": "user@example.com", "code": "123456",
            "new_password": "...", "confirm_password": "..." }

    Validates the OTP, then sets the new password on the user account.
    """
    email            = request.data.get('email', '').strip().lower()
    code             = request.data.get('code', '').strip()
    new_password     = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')

    # Basic validation
    if not all([email, code, new_password, confirm_password]):
        return Response(
            {'error': 'All fields are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_password != confirm_password:
        return Response(
            {'error': 'Passwords do not match.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate code
    entry = _reset_codes.get(email)
    if not entry:
        return Response(
            {'error': 'No reset code found. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if timezone.now() > entry['expires_at']:
        _reset_codes.pop(email, None)
        return Response(
            {'error': 'Reset code has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if entry['code'] != code:
        return Response(
            {'error': 'Incorrect reset code. Please try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update password
    try:
        user = (
            User.objects.filter(email__iexact=email).first() or
            User.objects.filter(username__iexact=email).first()
        )
        if not user:
            raise User.DoesNotExist
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    user.set_password(new_password)
    user.save()

    # Invalidate the used code and any existing auth tokens so old sessions die
    _reset_codes.pop(email, None)
    Token.objects.filter(user=user).delete()

    return Response(
        {'detail': 'Password updated successfully. Please log in with your new password.'},
        status=status.HTTP_200_OK
    )


# ── Authenticated Email Change ─────────────────────────────────────────────────

# Temporary store for pending email changes: { user_id: { new_email, code, expires_at } }
_email_change_codes: dict = {}


@api_view(['POST'])
def request_email_change(request):
    """
    POST /api/auth/request-email-change/
    Auth required. Body: { "new_email": "new@example.com" }
    Sends a 6-digit OTP to the NEW email address.
    """
    new_email = request.data.get('new_email', '').strip().lower()
    if not new_email:
        return Response({'error': 'New email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Make sure no other account already owns this email
    if User.objects.filter(email__iexact=new_email).exclude(pk=request.user.pk).exists():
        return Response({'error': 'This email is already in use by another account.'}, status=status.HTTP_400_BAD_REQUEST)

    code = _generate_code()
    timeout = int(getattr(django_settings, 'PASSWORD_RESET_TIMEOUT_MINUTES', 10))
    expires_at = timezone.now() + timedelta(minutes=timeout)
    _email_change_codes[request.user.pk] = {'new_email': new_email, 'code': code, 'expires_at': expires_at}

    try:
        send_mail(
            subject='MedSense — Verify your new email address',
            message=(
                f'Hello {request.user.username},\n\n'
                f'Your email change verification code is:\n\n'
                f'    {code}\n\n'
                f'This code expires in {timeout} minutes.\n'
                f'If you did not request this, please ignore this email.\n\n'
                f'— The MedSense Team'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[new_email],
            fail_silently=False,
        )
    except Exception as exc:
        return Response({'error': f'Failed to send verification email: {str(exc)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Verification code sent to your new email address.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def confirm_email_change(request):
    """
    POST /api/auth/confirm-email-change/
    Auth required. Body: { "code": "123456" }
    Verifies OTP and updates the user's email in the DB.
    """
    code = request.data.get('code', '').strip()
    if not code:
        return Response({'error': 'Verification code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    entry = _email_change_codes.get(request.user.pk)
    if not entry:
        return Response({'error': 'No pending email change. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

    if timezone.now() > entry['expires_at']:
        _email_change_codes.pop(request.user.pk, None)
        return Response({'error': 'Code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    if entry['code'] != code:
        return Response({'error': 'Incorrect code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

    # Apply the email update
    new_email = entry['new_email']
    request.user.email = new_email
    request.user.save()
    _email_change_codes.pop(request.user.pk, None)

    return Response({'detail': 'Email updated successfully.', 'email': new_email}, status=status.HTTP_200_OK)


# ── Authenticated Password Change ─────────────────────────────────────────────

@api_view(['POST'])
def change_password(request):
    """
    POST /api/auth/change-password/
    Auth required.
    Body: { "current_password": "...", "new_password": "...", "confirm_password": "..." }
    Verifies the current password before setting the new one.
    """
    current_password = request.data.get('current_password', '')
    new_password     = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not all([current_password, new_password, confirm_password]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify current password
    if not request.user.check_password(current_password):
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    if current_password == new_password:
        return Response({'error': 'New password must be different from your current password.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    # Rotate auth token so the user stays logged in with the new credentials
    Token.objects.filter(user=request.user).delete()
    new_token, _ = Token.objects.get_or_create(user=request.user)

    return Response({'detail': 'Password changed successfully.', 'token': new_token.key}, status=status.HTTP_200_OK)
