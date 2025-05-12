import { api } from '../lib/axios';
import { Notification, NotificationPreferences } from '../types/notification';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const notificationService = {
  getAll: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnread: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Notification;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.session.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  getPreferences: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no data found, return default preferences
      if (!data) {
        return {
          email: true,
          push: true,
          maintenance: true,
          alerts: true,
          messages: true,
          system: true
        } as NotificationPreferences;
      }
      
      // Extract notification preferences from user preferences
      const notificationPrefs = {
        email: data.preferences?.notifications?.email || true,
        push: data.preferences?.notifications?.push || true,
        maintenance: true,
        alerts: true,
        messages: true,
        system: true
      };
      
      return notificationPrefs as NotificationPreferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Return default preferences
      return {
        email: true,
        push: true,
        maintenance: true,
        alerts: true,
        messages: true,
        system: true
      } as NotificationPreferences;
    }
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // First get current preferences
      const { data: currentData, error: fetchError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      // If no preferences exist, start with defaults
      const currentPreferences = currentData?.preferences || {
        language: 'fr',
        timezone: 'Europe/Paris',
        notifications: {
          email: true,
          push: true,
          maintenance: true,
          alerts: true,
          messages: true,
          system: true
        }
      };
      
      // Update notification preferences
      const updatedPreferences = {
        ...currentPreferences,
        notifications: {
          ...currentPreferences.notifications,
          ...preferences
        }
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ preferences: updatedPreferences })
        .eq('id', session.session.user.id);
      
      if (updateError) throw updateError;
      
      // Return updated preferences
      return {
        email: updatedPreferences.notifications.email || true,
        push: updatedPreferences.notifications.push || true,
        maintenance: true,
        alerts: true,
        messages: true,
        system: true,
        ...preferences
      } as NotificationPreferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
};