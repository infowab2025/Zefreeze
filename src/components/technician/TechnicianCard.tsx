import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, Edit } from 'lucide-react';

interface TechnicianCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  specialties?: string[];
  active: boolean;
  onStatusToggle: () => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({
  id,
  name,
  email,
  phone,
  department,
  specialties,
  active,
  onStatusToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">{department || 'Département non assigné'}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {active ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Actif
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Inactif
              </>
            )}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            {email}
          </div>
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {phone}
            </div>
          )}
        </div>

        {specialties && specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Spécialités:</p>
            <div className="flex flex-wrap gap-1">
              {specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/users/${id}/edit`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Link>
          <Link
            to={`/dashboard/technician/schedule/${id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Planning
          </Link>
          <button
            onClick={onStatusToggle}
            className={`inline-flex items-center text-sm ${
              active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
            }`}
          >
            {active ? (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Désactiver
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Activer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;