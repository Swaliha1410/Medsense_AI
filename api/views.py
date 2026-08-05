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
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import User

from .models import (
    UserProfile, ChatMessage, HealthScore,
    MedicineReminder, MedicalReport, HospitalSearch, ContactInquiry,
    PasswordResetCode
)
from .serializers import (
    RegisterSerializer, UserSerializer, UserProfileSerializer,
    ChatMessageSerializer, HealthScoreSerializer, MedicineReminderSerializer,
    MedicalReportSerializer, HospitalSearchSerializer, ContactInquirySerializer
)

logger = logging.getLogger(__name__)

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
        # Always start fresh — sms_sent=False so the scheduler picks it up
        serializer.save(user=self.request.user, sms_sent=False)

    def perform_update(self, serializer):
        instance = self.get_object()
        data = serializer.validated_data

        # If reminder_time changes or status goes back to pending → reset SMS flag
        time_changed   = 'reminder_time' in data and data['reminder_time'] != instance.reminder_time
        back_to_pending = data.get('status') == 'pending' and instance.status != 'pending'

        if time_changed or back_to_pending:
            serializer.save(sms_sent=False, last_sms_at=None)
        else:
            serializer.save()


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
# Codes are stored in the database (PasswordResetCode model) so they survive
# server restarts — no more lost codes when Django reloads on file save.


def _generate_code(length: int = 6) -> str:
    """Return a random numeric OTP of the given length."""
    return ''.join(random.choices(string.digits, k=length))


def _mask_email(email: str) -> str:
    """
    Mask an email so its length is preserved exactly.
    local part: keep first char + stars equal to remaining local length + @ + domain
    e.g.  sahil@gmail.com  →  s****@gmail.com   (5 chars local → 1 + 4 stars)
          ab@yahoo.com     →  a*@yahoo.com       (2 chars local → 1 + 1 star)
          a@x.com          →  a@x.com            (1 char local  → just the char)
    """
    if '@' not in email:
        return email
    local, domain = email.split('@', 1)
    if len(local) <= 1:
        return f'{local}@{domain}'
    stars = '*' * (len(local) - 1)   # exact number of stars = remaining chars
    return f'{local[0]}{stars}@{domain}'


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code(request):
    """
    POST /api/auth/verify-reset-code/
    Body: { "email": "user@example.com", "code": "123456" }
    Accepts ANY valid (non-expired) code for that email — not just the latest.
    """
    email = request.data.get('email', '').strip().lower()
    code  = request.data.get('code', '').strip()

    if not email or not code:
        return Response({'error': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Accept any non-expired code for this email that matches the submitted code
    entry = (
        PasswordResetCode.objects
        .select_related('user')
        .filter(
            user__email__iexact=email,
            code=code,
            expires_at__gt=timezone.now()   # not yet expired
        )
        .order_by('-created_at')
        .first()
    )

    if not entry:
        return Response(
            {'error': 'Incorrect code. Please check your email and try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({'detail': 'Code verified.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }   (also accepts username)

    Generates a 6-digit OTP, stores it server-side (expires in 10 min),
    sends it to the user's registered email via SMTP, and returns it in the response.
    """
    identifier = request.data.get('email', '').strip()

    if not identifier:
        return Response(
            {'error': 'Email or username is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Resolve the User — match by email or username
    user = (
        User.objects.filter(email__iexact=identifier).first() or
        User.objects.filter(username__iexact=identifier).first()
    )

    if user and user.email:
        code = _generate_code()
        timeout = int(getattr(django_settings, 'PASSWORD_RESET_TIMEOUT_MINUTES', 10))
        expires_at = timezone.now() + timedelta(minutes=timeout)

        # Store in DB — survives server restarts unlike the old in-memory dict
        PasswordResetCode.objects.filter(user=user).delete()   # clear any old codes
        PasswordResetCode.objects.create(
            user=user, code=code, expires_at=expires_at
        )

        email_sent = False
        try:
            from django.core.mail import EmailMultiAlternatives
            import smtplib, ssl

            subject = 'Your MedSense verification code'

            # Plain text body
            text_body = (
                f'Hello {user.first_name or user.username},\n\n'
                f'Your MedSense password reset code is:\n\n'
                f'    {code}\n\n'
                f'This code expires in {timeout} minutes.\n\n'
                f'Do NOT share this code with anyone.\n'
                f'If you did not request this, please ignore this email.\n\n'
                f'— The MedSense Team'
            )

            # Rich HTML body — less likely to be flagged as spam
            html_body = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f6f9;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F6FFF,#14C8A8);
                       padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;
                         font-weight:800;letter-spacing:-0.5px;">
                Med<span style="color:#d0f5ef;">Sense</span>
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);
                        font-size:13px;">AI-Powered Health Companion</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#64748b;font-size:14px;">
                Hello <strong style="color:#0f172a;">
                  {user.first_name or user.username}
                </strong>,
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:14px;
                         line-height:1.6;">
                We received a request to reset your MedSense password.
                Use the code below to continue:
              </p>

              <!-- Code box -->
              <div style="background:#eff6ff;border:2px solid #bfdbfe;
                          border-radius:12px;padding:28px;text-align:center;
                          margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#3b82f6;font-size:12px;
                           font-weight:600;letter-spacing:0.05em;
                           text-transform:uppercase;">
                  Your Reset Code
                </p>
                <p style="margin:0;color:#1d4ed8;font-size:42px;
                           font-weight:900;letter-spacing:0.3em;
                           font-family:'Courier New',monospace;">
                  {code}
                </p>
                <p style="margin:12px 0 0;color:#6b7280;font-size:12px;">
                  Expires in <strong>{timeout} minutes</strong>
                </p>
              </div>

              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">
                ⚠️ Do NOT share this code with anyone. MedSense will never
                ask for your code by phone or email.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;
                       border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © 2026 MedSense &nbsp;|&nbsp; AI-Powered Health Companion
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

            # Build message with proper headers to pass spam filters
            import uuid
            from email.utils import formatdate
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=f'MedSense <{django_settings.EMAIL_HOST_USER}>',
                to=[f'{user.first_name or user.username} <{user.email}>'],
                reply_to=[f'MedSense Support <{django_settings.EMAIL_HOST_USER}>'],
            )
            msg.attach_alternative(html_body, 'text/html')

            # Minimal clean headers — avoid spam trigger words
            # X-Priority, Importance, X-Mailer are spammer signals — omit them
            msg.extra_headers = {
                'Message-ID':             f'<reset-{uuid.uuid4().hex}@medsense.app>',
                'Date':                   formatdate(localtime=True),
                'List-Unsubscribe':       f'<mailto:{django_settings.EMAIL_HOST_USER}?subject=unsubscribe>',
                'List-Unsubscribe-Post':  'List-Unsubscribe=One-Click',
                'Precedence':             'transactional',
            }

            msg.send(fail_silently=False)

            email_sent = True
            print(f'\n[MedSense] [OK] EMAIL SENT -> {user.email} | Code: {code}\n')
            logger.info(f'[MedSense] Reset code sent to {user.email} for {user.username}')

        except Exception as exc:
            logger.error(f'[MedSense] SMTP error: {exc}', exc_info=True)
            print(f'\n[MedSense] [FAIL] SMTP ERROR: {exc}\n')
            email_sent = False
        
        # Return masked email so frontend can show where code was sent
        # Never return the code itself — user must get it from their email
        masked = _mask_email(user.email)
        return Response(
            {
                'detail': 'A reset code has been sent to your email.',
                'email': user.email,          # used internally for verify/reset steps
                'masked_email': masked,       # shown to user on screen
                'expires_in_minutes': timeout,
                'email_sent': email_sent,
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

    # Accept any non-expired code for this email that matches — not just the latest
    entry = (
        PasswordResetCode.objects
        .select_related('user')
        .filter(
            user__email__iexact=email,
            code=code,
            expires_at__gt=timezone.now()
        )
        .order_by('-created_at')
        .first()
    )
    if not entry:
        return Response(
            {'error': 'Incorrect reset code. Please try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = entry.user  # get user from the matched entry

    # Update password
    user.set_password(new_password)
    user.save()

    # Delete the used code and all existing tokens so old sessions die
    PasswordResetCode.objects.filter(user=user).delete()
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


# ── AI Engine Views ────────────────────────────────────────────────────────────

from .ai_engine import symptom_analysis, chat_response, analyze_report_text, extract_text_from_file, compute_model_accuracy

# Cache accuracy result for 1 hour so every page load doesn't re-run benchmarks
import time as _time
_accuracy_cache: dict = {}
_ACCURACY_CACHE_TTL = 3600  # seconds


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ai_model_accuracy(request):
    """
    GET /api/ai/accuracy/
    Returns real-time model accuracy computed from the loaded datasets.
    Result is cached for 1 hour to avoid running benchmarks on every page load.
    """
    global _accuracy_cache
    now = _time.time()
    if _accuracy_cache.get('computed_at', 0) + _ACCURACY_CACHE_TTL > now:
        return Response(_accuracy_cache['data'], status=status.HTTP_200_OK)

    result = compute_model_accuracy()
    _accuracy_cache = {'computed_at': now, 'data': result}
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_chat(request):
    """
    POST /api/ai/chat/
    Body: { "message": "...", "history": [...] }
    Returns: { "response": "...", "intent": "...", "disease_info": {...} | null }
    """
    message = request.data.get('message', '').strip()
    history = request.data.get('history', [])

    if not message:
        return Response(
            {'error': 'Message is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = chat_response(message, conversation_history=history)

    # Persist both messages to DB if user is authenticated
    if request.user and request.user.is_authenticated:
        ChatMessage.objects.create(user=request.user, role='user',    content=message)
        ChatMessage.objects.create(user=request.user, role='assistant', content=result['response'])

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_analyze_symptoms(request):
    """
    POST /api/ai/analyze-symptoms/
    Body: {
        "symptoms": "...",
        "age": "30",
        "severity": "moderate",
        "duration": "few_days",
        "existing_conditions": "...",
        "medications": "...",
        "allergies": "..."
    }
    Returns structured symptom analysis.
    """
    symptoms = request.data.get('symptoms', '').strip()
    if not symptoms:
        return Response(
            {'error': 'Symptoms description is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = symptom_analysis(
        symptoms=symptoms,
        age=str(request.data.get('age', '')),
        severity=request.data.get('severity', 'moderate'),
        duration=request.data.get('duration', 'today'),
        existing_conditions=request.data.get('existing_conditions', ''),
        medications=request.data.get('medications', ''),
        allergies=request.data.get('allergies', ''),
    )

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_analyze_report(request):
    """
    POST /api/ai/analyze-report/

    Two modes:
      1. report_id  — load the stored MedicalReport, extract text from the file
                      (PDF via pdfplumber, image via pytesseract if available),
                      run AI analysis, cache the result, and return findings.
      2. report_text — analyse raw pasted text directly (legacy / fallback).

    Returns structured findings with interpretations and advice.
    """
    report_text = request.data.get('report_text', '').strip()
    report_id   = request.data.get('report_id', None)

    report_obj = None

    # ── Mode 1: load from stored file ────────────────────────────────────────
    if report_id:
        try:
            qs_filter = {'pk': report_id}
            if request.user and request.user.is_authenticated:
                qs_filter['user'] = request.user
            report_obj = MedicalReport.objects.get(**qs_filter)
        except MedicalReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

        # If we already have a cached summary AND extracted text use it
        if not report_text and report_obj.ai_summary:
            report_text = report_obj.ai_summary

        # Try to extract fresh text from the file
        if report_obj.file:
            try:
                file_path = report_obj.file.path  # absolute path on disk
                extracted = extract_text_from_file(file_path)
                if extracted.strip():
                    report_text = extracted
            except Exception as exc:
                logger.warning("File extraction error for report %s: %s", report_id, exc)

        # If we still have nothing we cannot analyse
        if not report_text:
            return Response(
                {
                    'error': (
                        'Could not extract text from this file. '
                        'For image reports (JPG/PNG), Tesseract OCR must be installed on the server. '
                        'For PDFs, ensure the file contains selectable text (not a scanned image). '
                        'You can also use the chat feature to paste your lab values directly.'
                    ),
                    'extraction_failed': True,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

    elif not report_text:
        return Response(
            {'error': 'report_text or report_id is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ── Run AI analysis ───────────────────────────────────────────────────────
    result = analyze_report_text(report_text)

    # ── Cache summary back on the model ──────────────────────────────────────
    if report_obj and request.user and request.user.is_authenticated:
        try:
            report_obj.ai_summary = report_text[:4000]  # store up to 4KB of source text
            report_obj.save(update_fields=['ai_summary'])
        except Exception:
            pass

    return Response(result, status=status.HTTP_200_OK)
