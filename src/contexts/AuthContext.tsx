import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  logout: () => {},
  isLoading: false,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

// Mock user UUIDs - using consistent UUIDs for demo accounts
const MOCK_USERS = {
  admin: '123e4567-e89b-12d3-a456-426614174000',
  tech: '123e4567-e89b-12d3-a456-426614174001',
  client: '123e4567-e89b-12d3-a456-426614174002'
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // For demo purposes, use mock data based on email
          const email = session.user.email;
          let mockUser: User;
          
          if (email === 'admin@zefreeze.com') {
            mockUser = {
              id: MOCK_USERS.admin,
              name: 'Admin User',
              email: 'admin@zefreeze.com',
              role: 'admin',
            };
          } else if (email === 'tech@zefreeze.com') {
            mockUser = {
              id: MOCK_USERS.tech,
              name: 'Tech User',
              email: 'tech@zefreeze.com',
              role: 'technician',
            };
          } else {
            mockUser = {
              id: MOCK_USERS.client,
              name: 'Client User',
              email: email || 'client@zefreeze.com',
              role: 'client',
            };
          }
          
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
        } else {
          // Check if we have a user in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // For demo purposes, use mock data based on email
            const email = session.user.email;
            let mockUser: User;
            
            if (email === 'admin@zefreeze.com') {
              mockUser = {
                id: MOCK_USERS.admin,
                name: 'Admin User',
                email: 'admin@zefreeze.com',
                role: 'admin',
              };
            } else if (email === 'tech@zefreeze.com') {
              mockUser = {
                id: MOCK_USERS.tech,
                name: 'Tech User',
                email: 'tech@zefreeze.com',
                role: 'technician',
              };
            } else {
              mockUser = {
                id: MOCK_USERS.client,
                name: 'Client User',
                email: email || 'client@zefreeze.com',
                role: 'client',
              };
            }
            
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
          } catch (err) {
            console.error('Auth state change error:', err);
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle demo accounts
      const demoAccounts = {
        'admin@zefreeze.com': {
          id: MOCK_USERS.admin,
          name: 'Admin User',
          email: 'admin@zefreeze.com',
          role: 'admin',
        },
        'tech@zefreeze.com': {
          id: MOCK_USERS.tech,
          name: 'Tech User',
          email: 'tech@zefreeze.com',
          role: 'technician',
        },
        'client@zefreeze.com': {
          id: MOCK_USERS.client,
          name: 'Client User',
          email: 'client@zefreeze.com',
          role: 'client',
        }
      };

      // Check if it's a demo account
      if (demoAccounts[email as keyof typeof demoAccounts]) {
        if (password === 'password') {
          const mockUser = demoAccounts[email as keyof typeof demoAccounts];
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          toast.success('Connexion réussie !');
          return;
        } else {
          throw new Error('Mot de passe incorrect. Veuillez réessayer.');
        }
      }

      // For non-demo accounts, proceed with Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Compte non trouvé. Veuillez vérifier vos identifiants.');
        }
        throw error;
      }
      
      if (data.user) {
        const mockUser: User = {
          id: MOCK_USERS.client, // Use client UUID for non-demo users
          name: 'User',
          email: data.user.email || '',
          role: 'client',
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast.success('Connexion réussie !');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors de la connexion.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Déconnexion réussie');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};