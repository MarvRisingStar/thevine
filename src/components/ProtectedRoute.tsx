import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  requireVerified?: boolean;
  children?: React.ReactNode;
}

export default function ProtectedRoute({ 
  requireAdmin = false, 
  requireVerified = false,
  children 
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireVerified && !profile?.email_verified && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
