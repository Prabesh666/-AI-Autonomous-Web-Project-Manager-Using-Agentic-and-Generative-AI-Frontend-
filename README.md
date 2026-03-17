# 🤖 AI Autonomous Project Manager — Frontend

<div align="center">

**An enterprise-grade, AI-powered project management interface built with React 19 + Vite 8**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

</div>

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **15 Production Pages** | Landing, Auth, Dashboard, Kanban Tasks, AI Review, AI Decision, AI Memory, Project Creation, Settings, Profile, Activity Log, and more |
| **🌙 Dark / Light Mode** | Global CSS variable system (`--bg-main`, `--text-primary`, etc.) powers seamless theme toggling across every page |
| **📱 Mobile Responsive** | Adaptive breakpoints at `1024px`, `900px`, `768px`, `600px`, and `480px` — fully tested on all screen sizes |
| **⚡ Code Splitting** | All routes are lazy-loaded via `React.lazy()` + `<Suspense>` with a polished global `<Loader />` spinner |
| **🔐 OAuth Integration** | Google & GitHub SSO via backend Passport.js, plus standard email/password authentication |
| **🐳 Production Ready** | Optimized Vite build, multi-stage Nginx Dockerfile, GitHub Actions CI/CD pipeline |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/                 # Loader spinner
│   └── layout/                 # DashboardLayout (Sidebar + Topbar + Theme Toggle)
├── pages/
│   ├── auth/                   # LoginPage, RegisterPage
│   ├── landing/                # LandingPage (Hero + Features + CTA)
│   ├── dashboard/              # DashboardHome, TaskBoard, AIWorkspace
│   ├── ai-review/              # AI Review — Chat + Insights split panel
│   ├── ai-decision/            # AI Decision Agent — Recommendations + Alternatives
│   ├── ai-memory/              # AI Memory — Chronological audit timeline
│   ├── ai-states/              # AI Loading & Error state demonstrations
│   ├── projects/               # Create New AI Project wizard
│   ├── activity-log/           # Activity Log table with filters
│   ├── profile/                # User Profile with tabs
│   └── settings/               # Settings (General, Security, Billing, Danger Zone)
├── routes/                     # AppRouter — centralized route definitions
├── services/                   # apiClient.js (REST API layer)
└── index.css                   # Global design tokens (light + dark variables)
```

---

## 🗺️ Route Map

### Standalone Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Hero section, feature grid, CTA, animated footer |
| `/login` | Login | Split-screen auth with Google & GitHub OAuth |
| `/register` | Register | Sign up with email, name, and password |
| `/ai-planning` | AI Workspace | 3-column AI planning interface with live chat |

### Dashboard Pages (Sidebar + Topbar Layout)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard Home | Task cards, progress tracking, kanban preview |
| `/tasks` | Task Board | Full Kanban board with To-Do, In Progress, Review columns |
| `/activity-log` | Activity Log | Filterable table of all project events |
| `/profile` | Profile | User info, security settings, notification preferences |
| `/settings` | Settings | General, Security, Billing & Subscription, Danger Zone |
| `/projects/new` | Create Project | AI-powered project creation with prompt input + templates |
| `/ai-review` | AI Review | Chat timeline + project health insights sidebar |
| `/ai-decision` | AI Decision | AI recommendation card + alternative strategies grid |
| `/ai-loading` | AI Loading State | Simulated plan generation with animated stepper |
| `/ai-error` | AI Error State | Error recovery modal with retry/edit actions |
| `/ai-memory` | AI Memory | Chronological audit trail of all AI events |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Prabesh666/AI-Autonomous-Web-Project-Manager-Using-Agentic-and-Generative-AI-Frontend.git
cd ai-autonomous-Frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_BACKEND_URL=https://ai-autonomous-backend.onrender.com" > .env

# Start development server
npm run dev
```

The app will be available at **`http://localhost:5173`**

---

## 🐳 Docker Deployment

```bash
# Build the production image
docker build -t ai-autonomous-ui .

# Run the container
docker run -d -p 8080:80 ai-autonomous-ui

# Available at http://localhost:8080
```

---

## 🧑‍💻 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🎨 Design System

The application uses a centralized CSS variable system defined in `src/index.css`:

```css
:root {
  --bg-main: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --input-bg: #f8fafc;
  --input-border: #cbd5e1;
  --btn-primary: #2563eb;
  /* ... */
}

[data-theme="dark"] {
  --bg-main: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --input-bg: #1f2937;
  --input-border: #374151;
  --btn-primary: #3b82f6;
  /* ... */
}
```

- **Typography**: Inter (Google Fonts) — weights 400–800
- **Colors**: Tailwind-inspired Slate/Blue palette
- **Border Radius**: Consistent `6px` (inputs) / `8px` (buttons) / `12px` (cards) / `16px` (hero cards)
- **Shadows**: Subtle depth with `box-shadow` for hover lift effects

---

## 🔐 Backend API

Base URL is configured via the `VITE_BACKEND_URL` environment variable.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate with email/password → JWT token |
| `POST` | `/api/auth/register` | Create a new user account |
| `GET` | `/api/auth/github` | Initiate GitHub OAuth flow |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow |

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI component library |
| React Router | 7.13 | Client-side routing with lazy loading |
| Vite | 8.0 | Build tool and dev server |
| ESLint | 9.x | Code linting and quality |
| Docker + Nginx | Latest | Production containerization |
| GitHub Actions | — | CI/CD pipeline |

---

## 📄 License

Proprietary and confidential. © 2024 AI Project Manager Inc. All rights reserved.
