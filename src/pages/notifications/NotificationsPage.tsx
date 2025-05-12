import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from '../../components/notifications/NotificationList';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';
import { Bell, Settings } from 'lucide-react';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const { notifications } = useNotifications();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Gérez vos notifications et préférences</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notifications
              {notifications.data && notifications.data.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {notifications.data.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Préférences
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'notifications' ? (
          <div className="bg-white rounded-lg shadow">
            <NotificationList />
          </div>
        ) : (
          <NotificationPreferences />
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;