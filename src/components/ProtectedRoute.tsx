
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { session, checkingSession } = useAuthSession();

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
