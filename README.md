# MedSense AI — Your Personal AI Healthcare Companion

MedSense is a full-stack web application that combines a React frontend with a Django REST API backend to deliver AI-powered health guidance, symptom analysis, medical report parsing, medicine reminders, and a real-time hospital finder.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Routing | React Router v7 |
| Maps | Leaflet + React-Leaflet, Overpass API, OSRM |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Auth | Token auth + Google OAuth (@react-oauth/google) |
| Backend | Django 6, Django REST Framework |
| AI/ML | Custom Python ML engine (CSV datasets) |
| PDF/OCR | pdfplumber, pytesseract |
| Database | SQLite (dev) |
| Translation | Google Translate Widget |

---

## Project Structure

```
├── src/                        # React frontend
│   ├── pages/                  # One file per route
│   ├── components/             # Shared UI components
│   │   └── dashboard/          # Dashboard-specific widgets
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API service layer (api.js)
│   └── utils/                  # Utility helpers
├── api/                        # Django app
│   ├── views.py                # All API view logic
│   ├── models.py               # Database models
│   ├── serializers.py          # DRF serializers
│   ├── urls.py                 # URL routing
│   ├── ai_engine.py            # AI/ML inference engine
│   ├── ml_trainer.py           # Model training utilities
│   ├── ml_inference.py         # Inference helpers
│   ├── scheduler.py            # Medicine reminder scheduler
│   ├── email_backends.py       # Custom email backend
│   └── datasets/               # CSV data files for AI
├── medsense_backend/           # Django project settings
│   └── settings.py
├── index.html                  # Vite entry point
├── vite.config.js
├── tailwind.config.js
└── manage.py
```

---

## Pages

| File | Route | Access | What it does |
|---|---|---|---|
| `Home.jsx` | `/` | Public | Landing page — Hero, Features, How It Works, Statistics, Testimonials, CTA |
| `Auth.jsx` | `/auth` | Public | Login, register, Google OAuth, forgot/reset password |
| `About.jsx` | `/about` | Public | Team, mission, values, tech stack, journey |
| `Chat.jsx` | `/chat` | Public | Full AI chat — sessions, voice input, file upload, language picker, markdown rendering |
| `ChatHistory.jsx` | `/chat-history` | Protected | Browse and delete past chat messages grouped by date |
| `Dashboard.jsx` | `/dashboard` | Protected | Overview — health score, quick actions, recent chats, reports, nearby hospitals, AI model accuracy widget |
| `HealthAnalysis.jsx` | `/health-analysis` | Protected | Symptom input form → AI analysis → concerns, guidance, treatments, warning signs |
| `MedicalReports.jsx` | `/reports` | Protected | Upload PDF/image reports, list, delete, AI analysis modal with parameter findings table |
| `Medicines.jsx` | `/medicines` | Protected | Add/edit/delete medicine reminders, mark taken/missed, daily progress bar |
| `HospitalMap.jsx` | `/hospitals` | Public | Overpass API hospital search, Leaflet map, OSRM routing, filter/sort, detail card |
| `HospitalDetail.jsx` | `/hospitals/:osmType/:osmId` | Public | Individual hospital — map, directions, contact info, specialties, navigation options |
| `Navigate.jsx` | `/navigate` | Public | Full-screen turn-by-turn navigation with live GPS tracking and step list |
| `HealthProfile.jsx` | `/health-profile` | Protected | Edit personal + health info saved to backend profile |
| `Settings.jsx` | `/settings` | Protected | Notifications, language, email change (OTP flow), password change, account deletion |

---

## Components

### Layout
| File | What it does |
|---|---|
| `AppLayout.jsx` | Shell wrapper used by all protected pages — renders AppSidebar + AppHeader |
| `AppSidebar.jsx` | Left sidebar nav with links to Dashboard, Chat, Health Analysis, Reports, Medicines, Hospitals, Chat History, Health Profile, Settings, Logout |
| `AppHeader.jsx` | Top bar with notification bell and user dropdown (profile, settings, logout) |
| `Navbar.jsx` | Public pages top bar with links and auth buttons |
| `Footer.jsx` | Site-wide footer |

### Landing Page Sections
| File | What it does |
|---|---|
| `Hero.jsx` | Full-screen hero with animated headline and CTA buttons |
| `Features.jsx` | Grid of key feature highlights |
| `HowItWorks.jsx` | Step-by-step explainer section |
| `DashboardPreview.jsx` | Animated screenshot/preview of the dashboard |
| `Statistics.jsx` | Animated counters for key metrics |
| `Testimonials.jsx` | User testimonial cards |
| `CallToAction.jsx` | CTA section with "Get Started" modal form that calls `POST /api/contact/` |

### Utility Components
| File | What it does |
|---|---|
| `LeafletMap.jsx` | Reusable Leaflet map — markers, user location, route polyline, hospital selection |
| `Logo.jsx` | SVG logo component |
| `Scene3D.jsx` | Three.js 3D scene used in the hero |

### Dashboard Widgets (`components/dashboard/`)
| File | What it does |
|---|---|
| `AIAvatar.jsx` / `EnhancedAIAvatar.jsx` | Animated AI assistant avatar |
| `AIInsights.jsx` | AI-generated health insight card |
| `AnimatedBackground.jsx` | Decorative animated background for the dashboard |
| `AchievementBadge.jsx` / `BadgesWidget.jsx` | Gamification badges display |
| `FloatingHealthWidget.jsx` | Floating mini health metrics card |
| `HealthScoreCircle.jsx` / `HealthScoreWidget.jsx` | Circular health score visualization |
| `MedicineTracker.jsx` | Medicine checklist widget |
| `SleepTracker.jsx` | Sleep hours input and quality indicator |
| `StepsTracker.jsx` | Step count progress bar |
| `WaterTracker.jsx` | Water intake tracker with +/- controls |
| `StreakWidget.jsx` | Daily streak counter |
| `TimelineItem.jsx` | Single item in the daily timeline |

---

## Context Providers

| File | What it does |
|---|---|
| `AuthContext.jsx` | Global auth state — `user`, `isLoggedIn`, `loading`, `login`, `register`, `logout`, `refreshUser`. Reads token from `localStorage` on mount and calls `GET /api/auth/me/`. |
| `LanguageContext.jsx` | Wraps the Google Translate widget. Exposes `language` and `changeLanguage()`. Persists selection to `localStorage` and programmatically switches the hidden GT combo-box. |

---

## Custom Hooks

| File | What it does |
|---|---|
| `useHealthData.js` | localStorage-backed daily health tracking — water, steps, sleep, medicines, streak, badges, health score calculation. Auto-resets each new day. |
| `useNearbyHospitals.js` | Queries the Overpass API for hospitals within a given radius of the user's coordinates. Returns `{ hospitals, loading, error, refetch }`. |
| `useOSRMRoute.js` | Fetches a driving route from OSRM between two lat/lng points. Returns `{ coords, steps, distance, duration }`. |
| `useAccurateLocation.js` | High-accuracy GPS hook — polls `navigator.geolocation` with progressive refinement. Returns `{ location, accuracy, status, errorMsg, locate }`. |

---

## API Service (`src/services/api.js`)

All frontend HTTP calls go through this single file targeting `http://localhost:8000/api`.

| Export | Endpoints covered |
|---|---|
| `auth` | register, login, logout, me, Google OAuth, forgot/verify/reset password, request/confirm email change, change password |
| `profile` | GET and PATCH `/profile/` |
| `chat` | list (by session), sessions list, send, remove message, remove session |
| `healthScore` | list, latest, add |
| `medicines` | list, add, update, remove |
| `reports` | list, upload, remove, analyze (by ID), analyzeText |
| `hospitalSearches` | list, save, remove |
| `contact` | submit contact/CTA form |
| `ai` | chat, analyzeSymptoms, analyzeReport, getAccuracy |

---

## Backend (Django)

### `api/models.py`
Defines: `UserProfile`, `HealthScore`, `MedicineReminder`, `MedicalReport`, `HospitalSearch`, `ChatMessage`, `ContactInquiry`, `PasswordResetCode`

### `api/views.py`
All API logic including:
- Auth views (register, login, logout, me, Google OAuth, password reset, email change)
- `UserProfileView` — GET/PATCH profile
- ViewSets for Chat, HealthScore, MedicineReminder, MedicalReport, HospitalSearch
- AI endpoints — `ai_chat`, `ai_analyze_symptoms`, `ai_analyze_report`, `ai_model_accuracy`
- `chat_sessions` — returns distinct sessions with title and last message timestamp
- `ContactInquiryCreateView`

### `api/ai_engine.py`
Core AI engine. Loads CSV datasets on startup and provides:
- Symptom → disease matching using TF-IDF-style keyword scoring
- Treatment lookup from `diseases_treatments.csv`
- Medical report text parsing (extracts lab values, compares to normal ranges, flags abnormals)
- Response formatting for the chat endpoint
- Model accuracy metrics (cached 1 hour)

### `api/ml_trainer.py`
Utilities for training and evaluating the symptom-matching ML model. Reads `symptoms_diseases.csv` and `medicine_details.csv`, builds feature matrices, and exports accuracy metrics.

### `api/ml_inference.py`
Thin wrapper around the trained model for running inference from `ai_engine.py`.

### `api/scheduler.py`
APScheduler-based background job that checks `MedicineReminder` records and sends SMS/email reminders at the scheduled time.

### `api/email_backends.py`
Custom Django email backend for Gmail SMTP with fallback logging.

### `api/datasets/`
| File | Used for |
|---|---|
| `symptoms_diseases.csv` | Symptom → disease mapping for AI analysis |
| `diseases_treatments.csv` | Disease → treatment, specialist, home remedies |
| `medicine_details.csv` | Medicine info for chat and reminders |
| `az_medicines.csv` | A-Z medicine reference data |
| `report_analysis_keywords.csv` | Lab parameter names, normal ranges, units for report parsing |

---

## Setup

### Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django dev server
python manage.py runserver
```

### Frontend
```bash
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

### Environment Variables
Create a `.env` file in the project root:
```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

In `medsense_backend/settings.py` set your `SECRET_KEY`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, and any SMS gateway credentials.

---

## Key Features

- **AI Chat** — Conversational health assistant with session history, voice input, file upload, and multi-language support via Google Translate
- **Symptom Analysis** — Structured form → AI returns possible conditions, treatments, warning signs, and next steps
- **Medical Reports** — Upload PDF or image reports; AI extracts lab values, flags abnormals, and gives plain-English interpretation
- **Medicine Reminders** — Track medications with frequency, time, and dosage; mark taken/missed; SMS/email reminders via scheduler
- **Hospital Finder** — Real-time hospital search using OpenStreetMap Overpass API, interactive Leaflet map, OSRM driving routes, turn-by-turn navigation
- **Health Profile** — Stores blood group, allergies, emergency contacts, height, weight
- **Dashboard** — Unified overview with health score, recent activity, AI model accuracy metrics
- **Auth** — Token-based login, Google OAuth, forgot password via email OTP, email/password change in settings
