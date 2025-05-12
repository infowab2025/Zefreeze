import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Vérifie si un utilisateur est actuellement connecté
 * @returns Promise<boolean> true si un utilisateur est connecté, false sinon
 */
export const checkAuthSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Erreur lors de la vérification de la session:', error);
    return false;
  }
};

/**
 * Vérifie si un utilisateur est connecté et affiche un message si ce n'est pas le cas
 * @returns Promise<boolean> true si un utilisateur est connecté, false sinon
 */
export const ensureAuthSession = async (): Promise<boolean> => {
  const isAuthenticated = await checkAuthSession();
  if (!isAuthenticated) {
    toast.error('Vous devez être connecté pour effectuer cette action. Veuillez vous connecter.');
  }
  return isAuthenticated;
};

/**
 * Crée un utilisateur admin par défaut
 * @param email Email de l'utilisateur admin
 * @param password Mot de passe de l'utilisateur admin
 * @returns Promise<boolean> true si l'utilisateur a été créé avec succès, false sinon
 */
export const createDefaultAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('role', 'admin');
    
    if (checkError) throw checkError;
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Un utilisateur admin avec cet email existe déjà');
      return true;
    }
    
    // Créer l'utilisateur dans Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    });
    
    if (authError) throw authError;
    
    if (!authUser.user) {
      throw new Error('Échec de la création de l\'utilisateur dans Auth');
    }
    
    // Créer l'utilisateur dans la table users
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          name: 'Admin User',
          email,
          role: 'admin',
          active: true,
          preferences: {
            language: 'fr',
            timezone: 'Europe/Paris',
            notifications: { email: true, push: true }
          }
        }
      ]);
    
    if (userError) throw userError;
    
    console.log('Utilisateur admin créé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', error);
    return false;
  }
};

/**
 * Vérifie si les utilisateurs par défaut existent et les crée si nécessaire
 */
export const ensureDefaultUsers = async (): Promise<void> => {
  try {
    // Vérifier si les utilisateurs par défaut existent
    const { data: users, error } = await supabase
      .from('users')
      .select('email, role')
      .in('email', ['admin@zefreeze.com', 'tech@zefreeze.com', 'client@zefreeze.com']);
    
    if (error) throw error;
    
    const existingEmails = users?.map(user => user.email) || [];
    
    // Créer les utilisateurs manquants
    if (!existingEmails.includes('admin@zefreeze.com')) {
      await createDefaultAdmin('admin@zefreeze.com', 'password');
    }
    
    // Afficher un message de succès
    toast.success('Vérification des utilisateurs par défaut terminée');
  } catch (error) {
    console.error('Erreur lors de la vérification des utilisateurs par défaut:', error);
    toast.error('Erreur lors de la vérification des utilisateurs par défaut');
  }
};