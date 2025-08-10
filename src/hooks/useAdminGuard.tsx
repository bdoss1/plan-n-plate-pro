import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/admin';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const email = profile?.email || user?.email;

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdminEmail(email)) return <div className="p-6">Access denied.</div>;

  return <>{children}</>;
}
