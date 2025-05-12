import { supabase } from '../lib/supabase-client';
import { toast } from 'react-hot-toast';

/**
 * Vérifie si l'utilisateur est connecté et a le rôle requis
 * @param requiredRole Rôle requis pour accéder à la ressource
 * @returns Promise<boolean> Indiquant si l'utilisateur a les droits d'accès
 */
export const checkUserAccess = async (requiredRole?: 'admin' | 'technician' | 'client'): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      return false;
    }

    // Si aucun rôle spécifique n'est requis, l'authentification suffit
    if (!requiredRole) {
      return true;
    }

    // Récupérer le profil utilisateur pour vérifier son rôle
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      toast.error('Erreur lors de la vérification des droits d\'accès');
      return false;
    }

    // Vérifier si l'utilisateur a le rôle requis (les admins ont accès à tout)
    if (user.role === requiredRole || user.role === 'admin') {
      return true;
    }

    toast.error(`Accès restreint. Vous devez être ${
      requiredRole === 'admin' ? 'administrateur' : 
      requiredRole === 'technician' ? 'technicien' : 'client'
    } pour accéder à cette page.`);
    return false;
  } catch (error) {
    console.error('Error checking user access:', error);
    toast.error('Erreur lors de la vérification des droits d\'accès');
    return false;
  }
};

/**
 * Crée un nouvel utilisateur avec Supabase Auth et dans la table users
 */
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'technician' | 'client';
  phone?: string;
  companyId?: string;
}) => {
  try {
    // Vérifier si l'utilisateur courant est admin
    const isAdmin = await checkUserAccess('admin');
    if (!isAdmin) {
      throw new Error('Seuls les administrateurs peuvent créer des utilisateurs');
    }

    // Récupérer le token d'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Session non trouvée');
    }

    // Appeler la fonction Edge pour créer l'utilisateur
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        company_id: userData.companyId,
        preferences: {
          language: 'fr',
          timezone: 'Europe/Paris',
          notifications: { email: true, push: true }
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la création de l\'utilisateur');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Vérifie si l'utilisateur est connecté, sinon le redirige vers la page de connexion
 */
export const ensureAuthenticated = async (navigate: (path: string) => void): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error('Veuillez vous connecter pour accéder à cette page');
    navigate('/login');
    return false;
  }
  return true;
};