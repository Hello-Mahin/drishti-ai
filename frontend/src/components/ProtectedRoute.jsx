import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 rounded-full border-3 border-brand-teal/20 border-t-brand-teal animate-spin mb-4"></div>
        <p className="text-sm font-medium text-brand-muted">Verifying session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
