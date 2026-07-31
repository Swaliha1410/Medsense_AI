from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'chat', views.ChatMessageViewSet, basename='chat')
router.register(r'health-scores', views.HealthScoreViewSet, basename='health-scores')
router.register(r'medicines', views.MedicineReminderViewSet, basename='medicines')
router.register(r'reports', views.MedicalReportViewSet, basename='reports')
router.register(r'hospital-searches', views.HospitalSearchViewSet, basename='hospital-searches')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/',    views.login_view,              name='login'),
    path('auth/logout/',   views.logout_view,             name='logout'),
    path('auth/me/',       views.me_view,                 name='me'),
    path('auth/google/',          views.google_auth,     name='google-auth'),
    path('auth/forgot-password/', views.forgot_password,          name='forgot-password'),
    path('auth/verify-reset-code/', views.verify_reset_code,      name='verify-reset-code'),
    path('auth/reset-password/',  views.reset_password,           name='reset-password'),
    path('auth/request-email-change/', views.request_email_change, name='request-email-change'),
    path('auth/confirm-email-change/', views.confirm_email_change, name='confirm-email-change'),
    path('auth/change-password/', views.change_password,          name='change-password'),

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),

    # Health score shortcut
    path('health-scores/latest/', views.latest_health_score, name='health-score-latest'),

    # Contact / CTA form
    path('contact/', views.ContactInquiryCreateView.as_view(), name='contact'),

    # Router-generated CRUD endpoints
    path('', include(router.urls)),
]
