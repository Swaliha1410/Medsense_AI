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

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),

    # Health score shortcut
    path('health-scores/latest/', views.latest_health_score, name='health-score-latest'),

    # Contact / CTA form
    path('contact/', views.ContactInquiryCreateView.as_view(), name='contact'),

    # Router-generated CRUD endpoints
    path('', include(router.urls)),
]
