import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';

interface InstallationStatusBadgeProps {
  status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
}

const InstallationStatusBadge: React.FC<InstallationStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4 mr-1" />,
          label: 'En attente'
        };
      case 'assigned':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <User className="h-4 w-4 mr-1" />,
          label: 'Technicien assigné'
        };
      case 'scheduled':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <Calendar className="h-4 w-4 mr-1" />,
          label: 'Planifiée'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          label: 'Terminée'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="h-4 w-4 mr-1" />,
          label: 'Annulée'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="h-4 w-4 mr-1" />,
          label: status
        };
    }
  };

  const { color, icon, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

export default InstallationStatusBadge;