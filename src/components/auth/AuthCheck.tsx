import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureAuthSession, ensureDefaultUsers } from '../../utils/auth-check';
import { useAuth } from '../../contexts/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      const authenticated = await ensureAuthSession();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        navigate(redirectTo);
      } else {
        // Si l'utilisateur est authentifié et est admin, vérifier les utilisateurs par défaut
        if (user?.role === 'admin') {
          await ensureDefaultUsers();
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate, redirectTo, user]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthCheck;