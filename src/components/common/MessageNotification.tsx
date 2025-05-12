import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const MessageNotification = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only proceed if we have a valid user ID that's a UUID
    if (!user?.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id)) {
      console.warn('Invalid or missing user ID');
      return;
    }

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('read', false);
        
        if (error) {
          console.error('Error fetching unread messages:', error.message);
          return;
        }

        setUnreadCount(count ?? 0);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in message notification:', error.message);
        } else {
          console.error('Unknown error in message notification');
        }
        setUnreadCount(0); // Set default value on error
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, () => {
        fetchUnreadCount(); // Refresh count on new message
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      }, () => {
        fetchUnreadCount(); // Refresh count on update
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Don't render anything if there's no user or no unread messages
  if (!user?.id || unreadCount === 0) return null;

  return (
    <Link to="/dashboard/messages" className="relative">
      <Mail className="h-6 w-6 text-gray-500 hover:text-gray-700" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </Link>
  );
};

export default MessageNotification;