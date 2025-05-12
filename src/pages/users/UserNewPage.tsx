import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUsers } from '../../hooks/useUsers';
import { useCompanies } from '../../hooks/useCompanies';
import { UserFormData } from '../../types/user';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const UserNewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { companies } = useCompanies();
  const { createUser } = useUsers();
  
  // Get role from query params if available
  const queryParams = new URLSearchParams(location.search);
  const roleFromQuery = queryParams.get('role');

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== 'admin') {
      toast.error('Accès non autorisé. Seuls les administrateurs peuvent créer des utilisateurs.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<UserFormData>({
    defaultValues: {
      role: roleFromQuery || 'client',
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        notifications: {
          email: true,
          push: true
        }
      }
    }
  });

  // Set role from query params when component mounts
  useEffect(() => {
    if (roleFromQuery && ['admin', 'technician', 'client'].includes(roleFromQuery)) {
      setValue('role', roleFromQuery);
    }
  }, [roleFromQuery, setValue]);

  const selectedRole = watch('role');

  const onSubmit = async (data: UserFormData) => {
    // Double-check user is admin before submitting
    if (!user || user.role !== 'admin') {
      toast.error('Accès non autorisé. Seuls les administrateurs peuvent créer des utilisateurs.');
      return;
    }

    setIsSubmitting(true);
    try {
      // For client role, company_id is required
      if (data.role === 'client' && !data.companyId) {
        throw new Error('Une entreprise doit être sélectionnée pour les utilisateurs de type client');
      }

      await createUser({
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        role: data.role,
        phone: data.phone,
        companyId: data.companyId,
        preferences: data.preferences || {
          language: 'fr',
          timezone: 'Europe/Paris',
          notifications: { email: true, push: true }
        },
        metadata: data.role === 'technician' ? {
          department: 'Technique',
          specialties: ['Froid commercial', 'VMC']
        } : {}
      });
      
      toast.success('Utilisateur créé avec succès');
      navigate('/dashboard/users');
    } catch (error: any) {
      console.error('Form submission error:', {
        message: error.message,
        error
      });
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not admin, don't render the form
  if (user && user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel utilisateur</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                type="text"
                {...register('name', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Ce champ est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="jean.dupont@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                {...register('role', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="admin">Administrateur</option>
                <option value="technician">Technicien</option>
                <option value="client">Client</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                {...register('password', { 
                  minLength: {
                    value: 8,
                    message: 'Le mot de passe doit contenir au moins 8 caractères'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Laissez vide pour générer automatiquement"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entreprise {selectedRole === 'client' && <span className="text-red-500">*</span>}
              </label>
              <select
                {...register('companyId', {
                  required: selectedRole === 'client' ? 'Une entreprise est requise pour les clients' : false
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">
                  {companies.isLoading ? 'Chargement des entreprises...' : 'Sélectionnez une entreprise'}
                </option>
                {Array.isArray(companies.data) && companies.data.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Préférences</h2>
            
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('preferences.notifications.email')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Notifications par email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('preferences.notifications.push')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Notifications push
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Langue</label>
                  <select
                    {...register('preferences.language')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuseau horaire</label>
                  <select
                    {...register('preferences.timezone')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/users')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserNewPage;