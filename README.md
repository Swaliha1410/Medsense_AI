# MedSense - AI Healthcare Platform Landing Page

A premium, modern landing page for MedSense, an AI-powered healthcare platform. Built with React, Three.js, Framer Motion, and Tailwind CSS.

## 🎨 Design Features

- **Premium Apple-inspired Design** - Clean, minimalist aesthetic
- **Glassmorphism UI** - Transparent navbar with blur effects
- **3D Interactive Scene** - Floating capsule with medical cross, orbit rings, and animated particles
- **Smooth Animations** - Framer Motion for buttery smooth transitions
- **Responsive Layout** - Works perfectly on all devices
- **Gradient Accents** - Beautiful blue-to-teal gradients throughout

## 🚀 Tech Stack

- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Three Fiber** - 3D graphics
- **@react-three/drei** - Three.js helpers
- **Lucide React** - Icons

## 🎯 Features

### Hero Section
- Transparent glassmorphism navbar
- Split hero layout with compelling copy
- Interactive 3D scene with:
  - Glossy floating capsule with medical cross
  - Rotating orbit ring
  - Animated particles
  - Mouse parallax (via OrbitControls)
  - Floating medical icons
  - Soft glow effects
- Smooth fade-in animations
- Feature badges (AI Powered, Voice Assistant, Secure, Hospital Finder)

### Features Section
- Four premium glassmorphism cards
- Hover animations with scale and lift effects
- Icons: AI Chat Assistant, Smart Symptom Checker, Nearby Hospital Finder, Medical Report Analysis

### How It Works Section
- Horizontal timeline with 4 steps
- Numbered badges and gradient connecting line
- Step cards: Describe Symptoms → AI Understands → Personalized Guidance → Find Nearby Hospital

### Dashboard Preview Section
- Floating mockup cards in responsive grid
- Cards: AI Chat (large), Health Score, Hospital Finder, Medicine Reminder, Medical Reports
- Gradient hover effects

### Statistics Section
- Animated counters that count up on scroll
- Four key metrics: 100K+ Health Queries, 500+ Hospitals, 98% Accuracy, 24/7 Support

### Testimonials Section
- Three premium review cards
- Star ratings, avatars with gradients
- Real user testimonials with names and roles

### Call To Action Section
- Large gradient glassmorphism card
- "Start Your Health Journey Today" headline
- Two prominent CTA buttons
- Trust indicators (No credit card, Free to start, Cancel anytime)

### Footer Section
- Brand section with logo and social links
- Quick Links, Legal, and Contact information
- Social media icons with hover effects
- Copyright and attribution

## 📦 Installation

All dependencies are already installed! Just run:

\`\`\`bash
npm run dev
\`\`\`

Then open your browser to `http://localhost:5173`

## 🎨 Color Palette

- **Primary Blue**: #0F6FFF
- **Primary Teal**: #14C8A8
- **Background**: #F8FAFC
- **Cards**: White (#FFFFFF)
- **Text**: #0F172A

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Glassmorphism navigation bar
│   │   ├── Hero.jsx                # Hero section with content
│   │   ├── Scene3D.jsx             # 3D Three.js scene
│   │   ├── Features.jsx            # Four feature cards
│   │   ├── HowItWorks.jsx          # Timeline with 4 steps
│   │   ├── DashboardPreview.jsx    # Dashboard mockup cards
│   │   ├── Statistics.jsx          # Animated counter stats
│   │   ├── Testimonials.jsx        # User testimonials
│   │   ├── CallToAction.jsx        # CTA section
│   │   └── Footer.jsx              # Footer with links
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML template
├── tailwind.config.js              # Tailwind configuration
├── vite.config.js                  # Vite configuration
└── package.json                    # Dependencies
```

## 🌟 Design Inspiration

This landing page is inspired by world-class design from:
- Apple - Clean, minimal aesthetic
- Claude AI - Modern AI product presentation
- Linear - Smooth animations and interactions
- Stripe - Professional, trustworthy design
- Vercel - Bold typography and gradients

## 🔧 Customization

### Changing Colors
Edit `tailwind.config.js` to update the color scheme.

### Modifying 3D Scene
Edit `src/components/Scene3D.jsx` to adjust 3D objects, animations, or particles.

### Updating Content
Edit `src/components/Hero.jsx` and `src/components/Navbar.jsx` for text and CTA buttons.

## 🚀 Build for Production

\`\`\`bash
npm run build
\`\`\`

The production-ready files will be in the `dist/` folder.

---

Built with ❤️ using React, Three.js, and Tailwind CSS
