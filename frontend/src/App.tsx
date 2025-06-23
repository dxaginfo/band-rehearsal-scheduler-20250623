import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from './store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BandsPage from './pages/BandsPage';
import BandDetailsPage from './pages/BandDetailsPage';
import RehearsalDetailsPage from './pages/RehearsalDetailsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Protected route component
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public route component (redirects to dashboard if already logged in)
  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bands" element={<BandsPage />} />
        <Route path="bands/:bandId" element={<BandDetailsPage />} />
        <Route path="rehearsals/:rehearsalId" element={<RehearsalDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Not found route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
