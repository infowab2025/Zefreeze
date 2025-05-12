import React from 'react';
import { format } from 'date-fns';
import { 
  Bell, AlertTriangle, CheckCircle, 
  MessageSquare, Settings, Clock 
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationList = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (notifications.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <button
          onClick={() => markAllAsRead.mutate()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {notifications.data?.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.message}
                </p>
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead.mutate(notification.id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Marquer comme lu
              </button>
            )}
          </div>
        ))}

        {notifications.data?.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Aucune notification
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;