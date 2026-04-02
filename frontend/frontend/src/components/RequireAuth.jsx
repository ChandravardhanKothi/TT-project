import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RequireAuth({ children }) {
  const { loading, loggedIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: 40 }}>
        Loading...
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

