import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell = () => {
  const { unreadNotifications } = useNotifications();
  const unreadCount = unreadNotifications.data?.length || 0;

  return (
    <div className="relative">
      <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;