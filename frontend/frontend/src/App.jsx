import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import RequireAuth from './components/RequireAuth';
import DashboardPage from './pages/DashboardPage';
import GeneratorPage from './pages/GeneratorPage';
import ChatbotPage from './pages/ChatbotPage';
import SocialPage from './pages/SocialPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function HomeRedirect() {
  const { loading, loggedIn } = useAuth();
  if (loading) return <div className="container" style={{ padding: 40 }}>Loading...</div>;
  return <Navigate to={loggedIn ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/generator"
          element={
            <RequireAuth>
              <GeneratorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chatbot"
          element={
            <RequireAuth>
              <ChatbotPage />
            </RequireAuth>
          }
        />
        <Route
          path="/social"
          element={
            <RequireAuth>
              <SocialPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

