from django.contrib.auth.models import User
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

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
