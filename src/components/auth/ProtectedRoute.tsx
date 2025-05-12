import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'technician' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      if (requiredRole) {
        if (user.role !== requiredRole && user.role !== 'admin') {
          toast.error(`Accès restreint. Vous devez être ${requiredRole === 'admin' ? 'administrateur' : requiredRole === 'technician' ? 'technicien' : 'client'} pour accéder à cette page.`);
          setIsAuthorized(false);
          return;
        }
      }

      setIsAuthorized(true);
    }
  }, [user, isLoading, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthorized === true) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default ProtectedRoute;