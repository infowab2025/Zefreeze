import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Thermometer, Calendar, Clock, 
  CheckCircle, AlertTriangle, User,
  ThermometerSnowflake, Fan
} from 'lucide-react';

interface TemperatureLogCardProps {
  log: {
    id: string;
    equipmentId: string;
    equipmentName: string;
    equipmentType: 'cold_storage' | 'vmc' | 'other';
    date: string;
    time: string;
    temperature: number;
    minThreshold: number;
    maxThreshold: number;
    isCompliant: boolean;
    notes?: string;
    technicianId: string;
    technicianName: string;
  };
}

const TemperatureLogCard: React.FC<TemperatureLogCardProps> = ({ log }) => {
  const getEquipmentIcon = () => {
    switch (log.equipmentType) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Thermometer className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      log.isCompliant ? 'border-green-200' : 'border-red-200'
    } hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {getEquipmentIcon()}
            <span className="ml-2 font-medium text-gray-900">{log.equipmentName}</span>
          </div>
          {log.isCompliant ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conforme
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Non conforme
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
            {format(new Date(log.date), 'dd/MM/yyyy', { locale: fr })}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            {log.time}
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <Thermometer className="h-5 w-5 text-gray-400 mr-2" />
          <span className={`text-lg font-bold ${
            log.isCompliant ? 'text-green-600' : 'text-red-600'
          }`}>
            {log.temperature} °C
          </span>
          <span className="text-xs text-gray-500 ml-2">
            (Seuils: {log.minThreshold} - {log.maxThreshold} °C)
          </span>
        </div>
        
        {log.notes && (
          <div className="mb-3 text-sm text-gray-600">
            <p className="font-medium">Notes:</p>
            <p>{log.notes}</p>
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          Relevé par {log.technicianName}
        </div>
      </div>
    </div>
  );
};

export default TemperatureLogCard;