import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Building, Calendar, MapPin, Phone, Mail,
  ThermometerSnowflake, Fan, Settings, CheckCircle, XCircle
} from 'lucide-react';
import { QuoteRequest } from '../../types/quote';

interface QuoteRequestCardProps {
  request: QuoteRequest;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  isConfirming?: boolean;
  isRejecting?: boolean;
}

const QuoteRequestCard: React.FC<QuoteRequestCardProps> = ({ 
  request, 
  onConfirm, 
  onReject,
  isConfirming,
  isRejecting
}) => {
  const getTypeIcon = () => {
    switch (request.type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeName = () => {
    switch (request.type) {
      case 'cold_storage':
        return 'Froid commercial';
      case 'vmc':
        return 'VMC';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-lg font-medium text-gray-900">{request.companyName}</span>
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              {getTypeIcon()}
              <span className="ml-2">{getTypeName()}</span>
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

            {request.preferredDate && (
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date souhaitée
                </div>
                <p className="text-gray-900 text-sm">
                  {format(new Date(request.preferredDate), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </div>
              <p className="text-gray-900 text-sm">{request.contactName}</p>
              <p className="text-gray-600 text-sm">{request.contactEmail}</p>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                Téléphone
              </div>
              <p className="text-gray-900 text-sm">{request.contactPhone}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onReject(request.id)}
            disabled={isRejecting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            {isRejecting ? 'Refus en cours...' : 'Refuser'}
          </button>
          
          <button
            onClick={() => onConfirm(request.id)}
            disabled={isConfirming}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isConfirming ? 'Confirmation...' : 'Confirmer'}
          </button>
          
          <Link
            to={`/dashboard/quotes/create?requestId=${request.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Créer devis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestCard;