# AI Autonomous Frontend

A full-featured, enterprise-grade React frontend for the AI Autonomous Project Manager — built with Vite, React Router, and a professional dark/light mode design system.

## 🚀 Features

- **6 Complete Pages** — Landing, Login, Register, Dashboard, Task Board, AI Planning Workspace
- **Toggleable Dark Mode** — Global CSS variables power instant theme switching across all pages
- **Mobile Responsive** — Every page adapts gracefully at `900px` and `480px` breakpoints
- **Code Splitting** — All routes are lazy-loaded via `React.lazy()` + `Suspense` with a global `<Loader />`
- **OAuth Integration** — GitHub and Google login via backend Passport.js
- **Production Ready** — Optimized Vite build, Nginx Dockerfile, GitHub Actions CI/CD

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── common/         # Loader spinner
│   └── layout/         # DashboardLayout (Sidebar + Topbar)
├── pages/
│   ├── auth/           # LoginPage, RegisterPage
│   ├── landing/        # LandingPage
│   └── dashboard/      # DashboardHome, TaskBoard, AIWorkspace
├── routes/             # AppRouter with all routes
├── services/           # apiClient.js (login, register API calls)
└── index.css           # Global CSS variables and design tokens
```

---

## 📄 Routes

| URL | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero, Features, CTA, Footer |
| `/login` | Login | Split-screen auth with Google/GitHub OAuth |
| `/register` | Register | Sign up with email |
| `/dashboard` | Dashboard Home | Task cards, progress tracking |
| `/tasks` | Task Board | Kanban-style columns |
| `/ai-planning` | AI Workspace | 3-column AI review interface with chat |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
git clone <repository-url>
cd ai-autonomous-Frontend

npm install

# Create .env file
echo "VITE_BACKEND_URL=https://ai-autonomous-backend.onrender.com" > .env

npm run dev
```

---

## 🐳 Docker

```bash
docker build -t ai-autonomous-ui .
docker run -d -p 8080:80 ai-autonomous-ui
# Available at http://localhost:8080
```

---

## 🧑‍💻 Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔐 Backend API

Base URL set via `VITE_BACKEND_URL` env variable.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Email login → JWT token |
| `POST` | `/api/auth/register` | Create account |
| `GET` | `/api/auth/github` | GitHub OAuth redirect |
| `GET` | `/api/auth/google` | Google OAuth redirect |

---

## 📄 License

Proprietary and confidential.
