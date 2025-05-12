import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MapPin, PenTool as Tool, ThermometerSnowflake, Fan, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface MobileInterventionCardProps {
  intervention: {
    id: string;
    type: 'repair' | 'maintenance' | 'installation' | 'audit';
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    description: string;
    scheduledDate: string;
    location: string;
    equipment?: {
      id: string;
      name: string;
      type: 'cold_storage' | 'vmc' | 'other';
    };
    client: {
      id: string;
      name: string;
    };
  };
}

const MobileInterventionCard: React.FC<MobileInterventionCardProps> = ({ intervention }) => {
  const getTypeIcon = () => {
    if (!intervention.equipment) {
      return <Tool className="h-5 w-5 text-gray-500" />;
    }
    
    switch (intervention.equipment.type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Tool className="h-5 w-5 text-purple-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (intervention.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="h-3 w-3 mr-1" />
            Planifiée
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Tool className="h-3 w-3 mr-1" />
            En cours
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    switch (intervention.priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Haute
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Moyenne
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Basse
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      intervention.status === 'pending' ? 'border-yellow-200' :
      intervention.status === 'scheduled' ? 'border-blue-200' :
      intervention.status === 'in_progress' ? 'border-purple-200' :
      intervention.status === 'completed' ? 'border-green-200' :
      'border-red-200'
    } hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {getTypeIcon()}
            <span className="ml-2 font-medium text-gray-900">
              {intervention.equipment?.name || 'Intervention'}
            </span>
          </div>
          <div className="flex space-x-1">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{intervention.description}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            {format(new Date(intervention.scheduledDate), 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            {intervention.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Building className="h-4 w-4 text-gray-400 mr-1" />
            {intervention.client.name}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Link
            to={`/dashboard/interventions/${intervention.id}/checklist`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Checklist d'intervention
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Calendar = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Building = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

export default MobileInterventionCard;