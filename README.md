# AI Autonomous UI

A robust, enterprise-grade React frontend application built with Vite, optimized for high performance and seamless developer experience.

## 🚀 Features

- **Modern Stack**: Built with React 19 and Vite for lightning-fast development and build times.
- **Production-Ready Builds**: Configured with optimized Vite manual chunk splitting to efficiently cache vendor libraries like React.
- **Strict Code Quality**:
  - **ESLint**: Utilizes the latest Flat Config API with strict production-ready rules to catch bugs early.
  - **Prettier**: Ensure consistent, team-wide code formatting.
- **Dockerized**: Includes a multi-stage `Dockerfile` optimized to serve static assets rapidly via Nginx.
- **CI/CD Integrated**: Automated GitHub Actions workflows that run `lint` and `build` validations on every Pull Request.

## 📁 Project Structure

This project follows a scalable, feature-based architecture pattern:

```text
src/
├── app/          # App-wide initialization and global state (e.g., Redux Store)
├── assets/       # Static assets like images, icons, and logos
├── components/   # Reusable UI components (buttons, modals, layout, etc)
├── config/       # Configuration variables and environment mappings
├── features/     # Feature-based groupings (e.g., auth, AI agents, tasks) containing components, slices, hooks
├── hooks/        # Custom, reusable React hooks
├── pages/        # Top-level route components mapped to URLs
├── routes/       # React Router configurations and protected routes
├── services/     # API clients and external service integrations
├── styles/       # Global CSS/SCSS and Tailwind styles (if applicable)
└── utils/        # Helper functions and utilities
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-autonomous-ui
   ```

2. Install dependencies (we recommend exact versions):
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

To build and run the application using Docker:

1. Build the Docker image:
   ```bash
   docker build -t ai-autonomous-ui .
   ```

2. Run the container:
   ```bash
   docker run -d -p 8080:80 --name ai-app ai-autonomous-ui
   ```
   The application will be available at `http://localhost:8080`.

## 🧑‍💻 Commands

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Starts the local Vite development server         |
| `npm run build`   | Packages the app for production in `dist/`       |
| `npm run preview` | Previews the production build locally            |
| `npm run lint`    | Runs ESLint to identify code quality issues      |

## 📄 License

This project is proprietary and confidential.
