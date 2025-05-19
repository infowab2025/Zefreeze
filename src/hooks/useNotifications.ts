import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { NotificationPreferences } from '../types/notification';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de charger les notifications. Vérifiez votre connexion internet.');
          return [];
        }
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const unreadNotifications = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de charger les notifications non lues. Vérifiez votre connexion internet.');
          return [];
        }
        console.error('Error fetching unread notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const defaultPreferences: NotificationPreferences = {
    email: true,
    push: true,
    maintenance: true,
    alerts: true,
    messages: true,
    system: true
  };

  const preferences = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        const { data, error } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // If no user preferences found, return defaults
        if (!data) {
          // Create default preferences for user
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              preferences: {
                language: 'fr',
                timezone: 'Europe/Paris',
                notifications: defaultPreferences
              }
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error creating default preferences:', updateError);
          }
          
          return defaultPreferences;
        }
        
        // Extract notification preferences from user preferences
        const notificationPrefs = {
          email: data.preferences?.notifications?.email ?? defaultPreferences.email,
          push: data.preferences?.notifications?.push ?? defaultPreferences.push,
          maintenance: data.preferences?.notifications?.maintenance ?? defaultPreferences.maintenance,
          alerts: data.preferences?.notifications?.alerts ?? defaultPreferences.alerts,
          messages: data.preferences?.notifications?.messages ?? defaultPreferences.messages,
          system: data.preferences?.notifications?.system ?? defaultPreferences.system
        };
        
        return notificationPrefs;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de charger les préférences. Vérifiez votre connexion internet.');
          return defaultPreferences;
        }
        console.error('Error fetching notification preferences:', error);
        return defaultPreferences;
      }
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de marquer la notification comme lue. Vérifiez votre connexion internet.');
          throw error;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Erreur lors du marquage de la notification comme lue');
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de marquer les notifications comme lues. Vérifiez votre connexion internet.');
          throw error;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications ont été marquées comme lues');
    },
    onError: () => {
      toast.error('Erreur lors du marquage des notifications');
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        // First get current preferences
        const { data: currentData, error: fetchError } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // If no preferences exist, start with defaults
        const currentPreferences = currentData?.preferences || {
          language: 'fr',
          timezone: 'Europe/Paris',
          notifications: defaultPreferences
        };
        
        // Update notification preferences
        const updatedPreferences = {
          ...currentPreferences,
          notifications: {
            ...currentPreferences.notifications,
            ...data
          }
        };
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ preferences: updatedPreferences })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        // Return updated preferences
        return {
          ...defaultPreferences,
          ...updatedPreferences.notifications,
          ...data
        } as NotificationPreferences;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          toast.error('Impossible de mettre à jour les préférences. Vérifiez votre connexion internet.');
          throw error;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      toast.success('Préférences de notification mises à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des préférences');
    },
  });

  return {
    notifications,
    unreadNotifications,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
};