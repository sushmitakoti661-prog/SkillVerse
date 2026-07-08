import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerification = true 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Elegant loading state that blends with the dark UI
    return (
      <div className="min-h-screen bg-[#03060C] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="mt-4 text-textMuted text-sm font-medium animate-pulse">Authenticating...</div>
      </div>
    );
  }

  // Not logged in? Redirect to home/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but email not verified (and route requires it)?
  if (requireVerification && !user.emailVerified && user.providerData[0]?.providerId === "password") {
    // Note: Social logins usually auto-verify email. We check if they logged in with password.
    // If they aren't verified, we redirect them to a special "verify email" wall route.
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};
