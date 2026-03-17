import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));

const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'));
const TaskBoard = lazy(() => import('../pages/dashboard/TaskBoard'));
const AIWorkspace = lazy(() => import('../pages/dashboard/AIWorkspace'));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ai-planning" element={<AIWorkspace />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/tasks" element={<TaskBoard />} />
            {/* Future nested routes could go here */}
            <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
            <Route path="/messages" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
