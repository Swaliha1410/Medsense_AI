# Testing Guide - New Dashboard & Pages

## 🚀 How to Run the Application

### Backend (Django)
```bash
cd "c:\Users\MY PC\Downloads\Medsense_AI-main\Medsense_AI-main"
python manage.py runserver
```
Backend will run on: **http://127.0.0.1:8000**

### Frontend (React + Vite)
```bash
cd "c:\Users\MY PC\Downloads\Medsense_AI-main\Medsense_AI-main"
npm run dev
```
Frontend will run on: **http://localhost:5173**

---

## 🔐 Authentication

### Login Flow
1. Navigate to **http://localhost:5173**
2. Click "Login" or "Get Started"
3. You'll see `/auth` page
4. Options:
   - **Google Sign-In** button (OAuth)
   - Traditional login form (username/password)
5. After login, you'll be redirected to `/dashboard`

### Create Test User (Optional)
If you need a test account:
```bash
python manage.py createsuperuser
# Username: testuser
# Email: test@medsense.com
# Password: testpass123
```

---

## 📱 Testing the New Pages

### 1. Dashboard (`/dashboard`)

#### What to Test:
✅ **Welcome Header**
- Check if your name appears correctly
- Subtitle shows "How can MedSense help you today?"

✅ **Main AI Card**
- Gradient background visible
- "Start a Conversation" button works
- Clicking redirects to `/chat`

✅ **Quick Action Cards**
- All 5 cards visible
- Hover effects work (border, shadow, scale)
- Each card links to correct page:
  - AI Assistant → `/chat`
  - Health Analysis → `/health-analysis`
  - Medical Reports → `/reports`
  - Medicines → `/medicines`
  - Hospital Finder → `/hospitals`

✅ **Health Snapshot**
- If no profile data: Shows empty state
- If profile exists: Shows blood group, allergies, etc.
- "View Profile" link works → `/health-profile`

✅ **Recent Conversations**
- If no chats: Shows empty state
- If chats exist: Shows last 3 messages
- Clicking message navigates to `/chat`

✅ **Recent Reports**
- If no reports: Shows empty state
- If reports exist: Shows last 3 reports
- Clicking report navigates to `/reports`

✅ **Nearby Hospitals**
- Shows hospital icon and message
- "Open Hospital Finder" button works → `/hospitals`

✅ **Health Insight**
- Shows if user has health score
- Displays appropriate message based on score
- Medical disclaimer visible

✅ **Emergency CTA**
- Red gradient background
- "Find Emergency Care" button works
- Links to `/hospitals?filter=emergency`

#### How to Test:
1. Log in and navigate to `/dashboard`
2. Check all sections render correctly
3. Click each quick action card
4. Test all "View" and action buttons
5. Verify empty states (if no data)
6. Add some data and verify it appears

---

### 2. Health Analysis (`/health-analysis`)

#### What to Test:
✅ **Initial Form State**
- Large symptom textarea visible
- Voice input button visible
- Duration selector (4 buttons)
- Severity selector (3 buttons)
- Optional fields (Age, Conditions, Allergies, Medications)
- "Analyze My Symptoms" button visible

✅ **Voice Input**
- Click microphone button
- Browser asks for microphone permission
- Speak symptoms
- Text appears in textarea
- Button turns red when listening

✅ **Form Interaction**
- Type in symptoms textarea
- Select duration (Today/Few Days/Weeks/More)
- Select severity (Mild/Moderate/Severe)
- Fill optional fields
- Submit button enabled when symptoms entered

✅ **Analysis Results**
- Loading state shows spinner
- Results appear after ~2 seconds
- All result cards visible:
  - Possible Health Concerns
  - Symptoms Identified
  - General Guidance
  - Recommended Next Steps
  - Warning Signs (red card)
  - When to Seek Medical Care
  - Medical Disclaimer (yellow card)
- Action buttons work:
  - "Find Nearby Care" → `/hospitals`
  - "Talk to MedSense" → `/chat`
  - "Analyze New Symptoms" → resets form

#### How to Test:
1. Navigate to `/health-analysis`
2. Enter symptoms: "headache, fever, cough"
3. Select duration: "Few Days"
4. Select severity: "Moderate"
5. Add optional info (optional)
6. Click "Analyze My Symptoms"
7. Wait for results (simulated ~2 sec)
8. Verify all result sections appear
9. Test action buttons
10. Click "Analyze New Symptoms"
11. Verify form resets

#### Test Voice Input:
1. Click microphone button
2. Allow microphone access
3. Say: "I have a headache and fever"
4. Check if text appears in textarea

---

### 3. Medical Reports (`/reports`)

#### What to Test:
✅ **Header & Stats**
- "Medical Reports" title visible
- "Upload New Report" button visible (top-right)
- 4 statistics cards show:
  - Total Reports
  - Analyzed
  - Pending
  - Shared

✅ **Search & Filters**
- Search input works
- Filter buttons work (All/Analyzed/Pending/Shared)
- Active filter highlighted in blue
- Search filters results in real-time

✅ **Empty State**
- If no reports: Shows empty state
- "Upload your first report" link visible
- Clicking opens upload modal

✅ **Reports Table**
- Shows all uploaded reports
- Columns: Name, Type, Date, Status, Actions
- Status badges:
  - Analyzed: Green with checkmark
  - Pending: Yellow with clock
- Hover effect on rows

✅ **Upload Modal**
- Opens when clicking "Upload New Report"
- Report Name input works
- Report Type dropdown has 8 options
- Drag & drop area visible
- Click to upload works
- File validation:
  - Only PDF, JPG, PNG allowed
  - Max 10MB size
- Selected file shows name and size
- "Upload & Analyze" button works
- Loading state shows spinner
- Modal closes after upload

✅ **Analysis Modal**
- Opens when clicking "View" on report
- If analyzed:
  - AI Summary card
  - Key Findings
  - Important Values table
  - General Recommendations
  - Medical Disclaimer
- If pending:
  - Shows "Pending analysis" message

✅ **Actions**
- View button → Opens analysis modal
- Download button → Downloads file
- Delete button → Confirms and deletes report

#### How to Test:
1. Navigate to `/reports`
2. Check statistics cards
3. Click "Upload New Report"
4. Fill report name: "Blood Test Results"
5. Select type: "Blood Test"
6. Upload a test PDF/image
7. Click "Upload & Analyze"
8. Wait for upload to complete
9. Verify report appears in table
10. Click "View" to see analysis
11. Click "Download" to download file
12. Click "Delete" to remove (confirm prompt)
13. Test search: Type report name
14. Test filters: Click "Analyzed" or "Pending"

---

### 4. Medicines (`/medicines`)

#### What to Test:
✅ **Placeholder Page**
- Shows pill icon
- "Medicines" title
- "Coming Soon" message
- "Under Construction" indicator

#### How to Test:
1. Navigate to `/medicines`
2. Verify placeholder page appears
3. Check design matches other pages (uses AppLayout)

---

## 🧭 Navigation Testing

### Sidebar Navigation
1. Click each menu item in sidebar
2. Verify active state highlights current page
3. Check all pages load correctly:
   - Dashboard
   - AI Assistant (existing)
   - Health Analysis (NEW)
   - Medical Reports (NEW)
   - Medicines (NEW)
   - Hospital Finder (existing)
   - Health Profile
   - Settings

### Header Dropdown
1. Click user avatar in top-right
2. Dropdown menu appears
3. Shows user name and email
4. Click "Health Profile" → navigates correctly
5. Click "Settings" → navigates correctly
6. Click "Logout" → logs out and redirects to `/auth`

### Breadcrumb Navigation
Test navigation flows:
- Dashboard → Health Analysis → Dashboard
- Dashboard → Medical Reports → Upload → Dashboard
- Dashboard → AI Assistant → Dashboard
- Dashboard → Hospital Finder → Dashboard

---

## 🎨 Visual Testing

### Responsive Design
Test on different screen sizes:
1. **Desktop (1920x1080)**
   - Sidebar visible
   - All cards in grid layout
   - Full width tables

2. **Tablet (768x1024)**
   - Sidebar collapses or hidden
   - Cards stack in 2 columns
   - Tables scroll horizontally

3. **Mobile (375x667)**
   - Sidebar hidden (burger menu)
   - Cards stack in 1 column
   - Tables scroll horizontally

### Color Scheme
Verify colors match design:
- Primary Blue: #0F6FFF
- Primary Teal: #14C8A8
- Gradients used correctly
- Status badges have correct colors

### Animations
Check smooth animations:
- Page transitions
- Card hover effects
- Button hover effects
- Modal open/close
- Loading spinners

---

## 🔒 Protected Routes Testing

### Test Authentication
1. **Logged Out State:**
   - Try accessing `/dashboard` → Redirects to `/auth`
   - Try accessing `/health-analysis` → Redirects to `/auth`
   - Try accessing `/reports` → Redirects to `/auth`

2. **Logged In State:**
   - Access `/dashboard` → Loads correctly
   - Access `/health-analysis` → Loads correctly
   - Access `/reports` → Loads correctly

3. **Logout Flow:**
   - Click logout in sidebar
   - Redirects to `/auth`
   - Try accessing protected routes → Redirects to `/auth`

---

## 🐛 Common Issues & Solutions

### Issue: Page not loading
**Solution:** Check if backend is running on port 8000

### Issue: Authentication not working
**Solution:** 
1. Check if Google Client ID is set in `.env`
2. Try traditional login with test credentials
3. Check browser console for errors

### Issue: Reports not uploading
**Solution:**
1. Check file size < 10MB
2. Check file type (PDF/JPG/PNG only)
3. Check backend logs for errors

### Issue: Voice input not working
**Solution:**
1. Allow microphone permission in browser
2. Use Chrome/Edge (best support)
3. Check if HTTPS or localhost

### Issue: Sidebar not showing
**Solution:** Check screen size - sidebar hidden on mobile

---

## ✅ Feature Verification Checklist

Before considering testing complete, verify:
- [ ] All new pages load without errors
- [ ] Sidebar navigation works
- [ ] Header dropdown works
- [ ] Authentication works (Google + traditional)
- [ ] Dashboard shows real user data
- [ ] Health Analysis form submits
- [ ] Medical Reports upload works
- [ ] Search and filters work
- [ ] Empty states display correctly
- [ ] Medical disclaimers visible
- [ ] Responsive design works
- [ ] All animations smooth
- [ ] No console errors
- [ ] Build completes successfully

---

## 📊 Test Data Setup (Optional)

### Create Sample Health Profile
1. Navigate to `/health-profile`
2. Fill in:
   - Blood Group: A+
   - Allergies: Peanuts
   - Height: 175 cm
   - Weight: 70 kg
3. Save profile
4. Check Dashboard → Health Snapshot updates

### Create Sample Chat Messages
1. Navigate to `/chat`
2. Send a few test messages
3. Check Dashboard → Recent Conversations updates

### Upload Sample Reports
1. Navigate to `/reports`
2. Upload 2-3 test PDF files
3. Check Dashboard → Recent Reports updates

---

## 🎉 Success Criteria

Your testing is successful if:
✅ All pages load without errors
✅ Navigation works smoothly
✅ Forms submit successfully
✅ Data displays correctly
✅ Empty states show appropriately
✅ Authentication protects routes
✅ Responsive design adapts
✅ No console errors
✅ Build completes successfully

**Happy Testing! 🚀**
