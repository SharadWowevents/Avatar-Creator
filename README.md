# Customer Avatar Creator (MERN Stack)

A modern full-stack **MERN (MongoDB, Express, React, Node.js)** application for the Customer Avatar Creator workbench.

It helps businesses map out their two core customer archetypes using the **Lifeboat vs. Yacht** model:
- 🐇 **Lifeboat Customer**: In trouble, high anxiety, urgent, needs immediate rescue.
- 🦅 **Yacht Customer**: Doing well, status-driven, aiming for benchmark transformation.
- 🌉 **Serve Both (The Bridge)**: Strategic pathway to rescue crisis clients and upgrade them into high-value annual retainers.

---

## 📸 Two-Page Layout

The application is split into two dedicated pages matching your design specifications:
1. **Page 1: Input Page (`/`)**:
   - Structured 5-field workbench form:
     - `1 · WOW INTRO — WHO YOU ARE`
     - `2 · ICP — IDEAL CUSTOMER PROFILE`
     - `3 · AS A LIFEBOAT — TOP 3 ISSUES YOU SOLVE` (signal orange highlight & hint)
     - `4 · AS A YACHT — TOP 3 ISSUES YOU SOLVE` (sea teal highlight & hint)
     - `5 · HOW YOU HELP BOTH`
   - Actions: **Create avatars** (navigates to Result Page upon generation), **Load Example** (WOW Events preset), and **Clear**.
2. **Page 2: Result Page (`/result`)**:
   - Interactive tab navigation: `[Lifeboat avatar]` `[Yacht avatar]` `[Serve both]`.
   - Top action banner: `EXAMPLE · WOW EVENTS` indicator, `← Edit Inputs` button, `📄 Download PDF`, `💾 Save to DB`.
   - Comprehensive Dossier Card:
     - Circular animal portrait with emoji (`🐇` / `🦅`)
     - Character title & subtitle (e.g. `Rescue Rhea the Restless Rabbit`)
     - "Why this animal?" context card
     - `CURRENT STATE → DESIRED STATE` transformation
     - `STAGE OF BUSINESS / LIFE`
     - Two-column breakdown: `TOP 3 PAIN POINTS` and `WHAT THEY WANT`
     - Two-column breakdown: `BUYING BEHAVIOUR` and `LANGUAGE THEY USE` (speech bubble tags)
     - `NEXT STEPS` (numbered step counters)
     - Standalone `Copy as text` button

---

## 🔐 User Authentication & SMTP OTP Reset

- **Create Account (`/register`)**:
  - Name
  - Mobile Number
  - Email Address
  - Password & Confirm Password
- **Login (`/login`)**:
  - Supports login via **Email or Mobile Number** and Password.
  - Generates secure JWT token persisted in client storage.
- **Forgot Password with SMTP OTP (`/forgot-password`)**:
  - **Step 1**: User enters their registered email address.
  - The backend generates a secure 6-digit numeric OTP and dispatches it via **SMTP** (`nodemailer`).
  - *Dev Mode Fallback*: If SMTP credentials are not yet configured in `.env`, the server automatically prints the OTP in the server terminal and displays a helpful preview hint on screen so you can test password reset right away!
  - **Step 2**: User enters the 6-digit OTP code and creates their new password.

---

## 🏗️ Architecture Overview

```
AvatarApp/
├── avatar-creator.html            # Original reference file
├── package.json                   # Root orchestrator (concurrently)
├── README.md                      # Full documentation
├── backend/                       # Node.js + Express + MongoDB Server
│   ├── .env                       # Config (PORT, MONGODB_URI, OPENAI_API_KEY, JWT_SECRET, SMTP)
│   ├── .env.example
│   ├── package.json
│   ├── server.js                  # Express app, CORS, IPv4 binding, healthcheck
│   ├── config/
│   │   └── db.js                  # Mongoose connection with graceful memory fallback
│   ├── models/
│   │   ├── User.js                # User Schema (name, mobile, email, password, OTP)
│   │   └── Avatar.js              # Avatar dossier Schema (linked to User)
│   ├── middleware/
│   │   └── auth.js                # JWT token verification (protect & optionalAuth)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth routes (register, login, forgot-password, reset-password, me)
│   │   └── avatarRoutes.js        # /api/avatars routes (generate & CRUD)
│   ├── controllers/
│   │   ├── authController.js      # Auth & password reset controllers
│   │   └── avatarController.js    # Generation & dossier CRUD controllers
│   ├── services/
│   │   ├── emailService.js        # Nodemailer SMTP OTP delivery service
│   │   └── aiService.js           # OpenAI GPT-6 Luna client + heuristic persona generator
│   └── test-unit.js               # Complete unit test suite (Controllers + Auth + SMTP)
└── frontend/                      # React 19 + Vite Frontend
    ├── index.html                 # Typography (Bricolage Grotesque, Instrument Sans, JetBrains Mono)
    ├── vite.config.js             # Dev server with proxy to http://127.0.0.1:5000
    └── src/
        ├── App.jsx                # Router setup & global state coordinator
        ├── index.css              # Custom styling matching screenshots & dark/light themes
        ├── context/
        │   └── AuthContext.jsx    # React Authentication Context (user, token, login, logout)
        ├── api/
        │   ├── authApi.js         # Register, login, forgot-password, reset-password API calls
        │   └── avatarApi.js       # Generation, fetch, save, delete API calls with auth headers
        ├── pages/
        │   ├── InputPage.jsx      # Page 1: Form inputs matching Image 1
        │   ├── ResultPage.jsx     # Page 2: Dossier result matching Image 2
        │   ├── LoginPage.jsx      # Login page (Email/Mobile + Password)
        │   ├── RegisterPage.jsx   # Create Account page (Name, Mobile, Email, Password)
        │   └── ForgotPasswordPage.jsx # Forgot Password & OTP verification page
        ├── components/
        │   ├── Header.jsx         # Header with page tabs, auth status, model badge, theme toggle
        │   ├── AvatarCard.jsx     # Lifeboat / Yacht avatar dossier card
        │   ├── BridgeCard.jsx     # Bridge card ("How you help both")
        │   └── SavedDrawer.jsx    # Slide-over drawer for user's saved dossiers
        ├── data/
        │   └── defaultData.js     # WOW Events sample inputs and baseline personas
        └── utils/
            └── pdfExport.js       # Standalone 3-page A4 PDF exporter (html2canvas + jsPDF)
```

---

## ⚙️ Environment Configuration

In `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/avatar-app

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-6-luna

# JWT Secret for Authentication
JWT_SECRET=supersecretjwtkey_avatarapp_2026

# SMTP Configuration for sending OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="WOW Events Customer Avatar Creator" <no-reply@avatarapp.com>
```

---

## 🚀 Quick Start Guide

### Start Both Backend and Frontend with One Command
From the root workspace directory:
```bash
npm run dev
```
- **Backend API**: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Frontend App**: [http://localhost:5173](http://localhost:5173)

### Or Run in Separate Terminals:
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```

### Run Full Test Suite:
```bash
cd backend
npm test
```
*(Runs generation, CRUD, account registration, login, forgot password OTP via SMTP, and password reset).*
