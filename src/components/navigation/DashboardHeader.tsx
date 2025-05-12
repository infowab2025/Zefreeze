import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, User } from 'lucide-react';
import { User as UserType } from '../../types/auth';
import NotificationBell from '../notifications/NotificationBell';
import NotificationList from '../notifications/NotificationList';
import MessageNotification from '../common/MessageNotification';

interface DashboardHeaderProps {
  openSidebar: () => void;
  user: UserType | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ openSidebar, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="px-4 py-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={openSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative hidden md:block w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rechercher..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <NotificationBell />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 z-50">
                <NotificationList />
              </div>
            )}
          </div>
          
          {/* Message Notification */}
          <MessageNotification />
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.name || 'Utilisateur'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrateur' : 
                 user?.role === 'technician' ? 'Technicien' : 'Client'}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;