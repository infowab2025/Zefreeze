import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, PenTool as Tool, Clock, User } from 'lucide-react';
import { InstallationRequest } from '../../types/installation';
import InstallationStatusBadge from './InstallationStatusBadge';

interface InstallationRequestCardProps {
  request: InstallationRequest;
}

const InstallationRequestCard: React.FC<InstallationRequestCardProps> = ({ request }) => {
  const getTypeIcon = () => {
    switch (request.type) {
      case 'cold_storage':
        return <Tool className="h-4 w-4 mr-2 text-blue-500" />;
      case 'vmc':
        return <Tool className="h-4 w-4 mr-2 text-green-500" />;
      default:
        return <Tool className="h-4 w-4 mr-2 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <InstallationStatusBadge status={request.status} />
          <span className="text-sm text-gray-500">
            {format(new Date(request.createdAt), 'dd/MM/yyyy')}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              {getTypeIcon()}
              {request.type === 'cold_storage' ? 'Froid commercial' :
               request.type === 'vmc' ? 'VMC' : 'Autre'}
            </div>
            <p className="text-gray-900 line-clamp-2">{request.description}</p>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Lieu d'installation
              </div>
              <p className="text-gray-900 text-sm">{request.location.address}</p>
            </div>

            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Date souhaitée
              </div>
              <p className="text-gray-900 text-sm">
                {format(new Date(request.preferredDate), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>

          {request.technicianId && (
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-2" />
              Technicien assigné
            </div>
          )}

          {request.scheduledDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              Planifié pour le {format(new Date(request.scheduledDate), 'dd/MM/yyyy')}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {request.status === 'pending' && (
            <Link
              to={`/dashboard/installations/assign/${request.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Assigner un technicien
            </Link>
          )}
          {request.status !== 'pending' && (
            <Link
              to={`/dashboard/installations/${request.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Voir détails
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationRequestCard;