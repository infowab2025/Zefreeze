import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { UserFormData } from '../types/user';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
  });

  const getUser = (id: string) => useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });

  const createUser = async (data: UserFormData) => {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Session error: ' + (sessionError?.message || 'No active session'));
      }
      
      // Create the user through the edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...data,
          company_id: data.companyId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('User creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData.error || 'Failed to create user');
      }

      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      return responseData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) => 
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    },
  });

  const updateUserStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      userService.updateStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Statut de l\'utilisateur mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  const resetPassword = useMutation({
    mutationFn: (email: string) => userService.resetPassword(email),
    onSuccess: () => {
      toast.success('Email de réinitialisation envoyé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    },
  });

  return {
    users,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetPassword,
  };
};