import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  intervention_id?: string;
  read: boolean;
  created_at: string;
  sender?: {
    name: string;
    email: string;
  };
  recipient?: {
    name: string;
    email: string;
  };
}

interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  interventionId?: string;
}

export const useMessages = (folder: 'inbox' | 'sent' | 'all' = 'inbox') => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const messages = useQuery({
    queryKey: ['messages', folder],
    queryFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        let query = supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(name, email),
            recipient:recipient_id(name, email)
          `);

        if (folder === 'inbox') {
          query = query.eq('recipient_id', user.id);
        } else if (folder === 'sent') {
          query = query.eq('sender_id', user.id);
        } else {
          query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Message[];
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erreur lors du chargement des messages');
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const getMessageHistory = async (userId: string) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(name, email),
          recipient:recipient_id(name, email)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    } catch (error) {
      console.error('Error fetching message history:', error);
      toast.error('Erreur lors du chargement de l\'historique des messages');
      return [];
    }
  };

  const sendMessage = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Try to use the edge function first
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('send-message', {
          body: {
            recipientId: data.recipientId,
            subject: data.subject,
            content: data.content,
            interventionId: data.interventionId
          }
        });
        
        if (functionError) throw functionError;
        return functionData;
      } catch (functionError) {
        console.warn('Edge function failed, falling back to direct DB access:', functionError);
        
        // Fallback to direct DB access
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: data.recipientId,
            subject: data.subject,
            content: data.content,
            intervention_id: data.interventionId,
            read: false,
          });
        
        if (error) throw error;
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message envoyé avec succès');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
    },
  });

  const getUnreadCount = useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          return 0;
        }

        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false);
        
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
    },
    enabled: !!user?.id,
  });

  return {
    messages,
    sendMessage,
    markAsRead,
    deleteMessage,
    getMessageHistory,
    unreadCount: getUnreadCount.data || 0,
    isLoading: messages.isLoading || getUnreadCount.isLoading,
  };
};