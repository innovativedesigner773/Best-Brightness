import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultPageForRole } from '../../utils/roleRouting';

export default function RoleBasedRedirect() {
  const { user, userProfile } = useAuth();
  
  if (user && userProfile) {
    const defaultPath = getDefaultPageForRole(userProfile.role);
    console.log(`🧭 Redirecting ${userProfile.role} user to: ${defaultPath}`);
    return <Navigate to={defaultPath} replace />;
  }
  
  return <Navigate to="/products" replace />;
}