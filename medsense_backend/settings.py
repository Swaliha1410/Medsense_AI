import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file if present (local development)
_env_file = BASE_DIR / '.env'
if _env_file.exists():
    with open(_env_file) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _key, _, _val = _line.partition('=')
                os.environ.setdefault(_key.strip(), _val.strip())

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-change-in-production')

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# ── Apps ──────────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    # Local
    'api',
]

# ── Middleware ────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'medsense_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'medsense_backend.wsgi.application'

# ── Database ──────────────────────────────────────────────────────────────────

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── Password validation ───────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalisation ──────────────────────────────────────────────────────

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ── Static & Media ────────────────────────────────────────────────────────────

STATIC_URL = 'static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Django REST Framework ─────────────────────────────────────────────────────

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the Vite dev server to call the Django API

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
]

CORS_ALLOW_CREDENTIALS = True

# ── Email / SMTP ──────────────────────────────────────────────────────────────
EMAIL_BACKEND        = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST           = 'smtp.gmail.com'
EMAIL_PORT           = 465          # SSL — avoids Gmail self-send deduplication bug
EMAIL_USE_SSL        = True
EMAIL_USE_TLS        = False        # TLS and SSL are mutually exclusive
EMAIL_HOST_USER      = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD  = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL   = os.environ.get('DEFAULT_FROM_EMAIL', 'MedSense')

PASSWORD_RESET_TIMEOUT_MINUTES = 30

# ── SMS via Fast2SMS ──────────────────────────────────────────────────────────
# Sign up free at https://www.fast2sms.com → Dev API → copy your API key
# Works directly with Indian numbers — no carrier gateway needed.
FAST2SMS_API_KEY  = os.environ.get('FAST2SMS_API_KEY', '')
CALLMEBOT_API_KEY = os.environ.get('CALLMEBOT_API_KEY', '')
TEXTBEE_API_KEY   = os.environ.get('TEXTBEE_API_KEY', '')
TEXTBEE_DEVICE_ID = os.environ.get('TEXTBEE_DEVICE_ID', '')

# How many minutes PAST reminder_time before the overdue SMS fires
MEDICINE_SMS_GRACE_MINUTES  = 5
# How often to re-send SMS until user marks medicine taken/missed
MEDICINE_SMS_REPEAT_MINUTES = 15
