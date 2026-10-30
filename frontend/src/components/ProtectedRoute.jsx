import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <div className="thinking" style={{ padding: '12px' }}>
            <span className="dot" />
            <span className="dot" />
            <span>Verifying session…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users directly to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

