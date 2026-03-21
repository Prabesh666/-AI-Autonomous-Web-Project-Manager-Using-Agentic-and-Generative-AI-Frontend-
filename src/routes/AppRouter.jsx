import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));

const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));
const AIWorkspace = lazy(() => import('../pages/dashboard/AIWorkspace'));
const ActivityLog = lazy(() => import('../pages/activity-log/ActivityLog'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const AiReviewPage = lazy(() => import('../pages/ai-review/AiReviewPage'));
const AiDecisionPage = lazy(() => import('../pages/ai-decision/AiDecisionPage'));
const ProjectListPage = lazy(() => import('../pages/projects/ProjectListPage'));
const ProjectDetailsPage = lazy(() => import('../pages/projects/ProjectDetailsPage'));
const CreateProjectPage = lazy(() => import('../pages/projects/CreateProjectPage'));
const AiLoadingPage = lazy(() => import('../pages/ai-states/AiLoadingPage'));
const AiErrorPage = lazy(() => import('../pages/ai-states/AiErrorPage'));
const AiMemoryPage = lazy(() => import('../pages/ai-memory/AiMemoryPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));

const TestDashboard = lazy(() => import('../pages/TestDashboard'));
import PrivateRoute from '../components/PrivateRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/ai-planning" element={<AIWorkspace />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/ai-review" element={<AiReviewPage />} />
            <Route path="/ai-decision" element={<AiDecisionPage />} />
            <Route path="/ai-loading" element={<AiLoadingPage />} />
            <Route path="/ai-error" element={<AiErrorPage />} />
            <Route path="/ai-memory" element={<AiMemoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {/* Future nested routes could go here */}
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/test-dashboard" element={<TestDashboard />} />
            <Route path="/messages" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
