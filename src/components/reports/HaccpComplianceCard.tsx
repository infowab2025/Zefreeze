import React from 'react';
import { 
  ShieldCheck, Droplet, Snowflake, 
  CheckCircle, XCircle, ThermometerSnowflake
} from 'lucide-react';

interface HaccpComplianceCardProps {
  compliance: {
    haccp: boolean;
    refrigerantLeak: boolean;
    frost: boolean;
    safetySystem?: boolean;
    cleaningProcedures?: boolean;
  };
  temperature?: {
    current: number;
    min: number;
    max: number;
  };
  equipmentName: string;
  date: string;
}

const HaccpComplianceCard: React.FC<HaccpComplianceCardProps> = ({
  compliance,
  temperature,
  equipmentName,
  date
}) => {
  const isFullyCompliant = Object.values(compliance).every(value => value === true);
  const temperatureCompliant = temperature 
    ? temperature.current >= temperature.min && temperature.current <= temperature.max
    : true;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      isFullyCompliant && temperatureCompliant ? 'border-green-200' : 'border-red-200'
    } hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <ThermometerSnowflake className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium text-gray-900">{equipmentName}</span>
          </div>
          {isFullyCompliant && temperatureCompliant ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conforme HACCP
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              Non conforme
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mb-3">
          Contrôle effectué le {date}
        </div>
        
        {temperature && (
          <div className={`flex items-center mb-3 p-2 rounded ${
            temperatureCompliant ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Thermometer className="h-5 w-5 mr-2 text-gray-500" />
            <span className={`font-medium ${
              temperatureCompliant ? 'text-green-700' : 'text-red-700'
            }`}>
              {temperature.current}°C
            </span>
            <span className="text-xs text-gray-500 ml-2">
              (Seuils: {temperature.min}°C - {temperature.max}°C)
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 text-blue-500 mr-1" />
              <span>Normes HACCP</span>
            </div>
            {compliance.haccp ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Droplet className="h-4 w-4 text-blue-500 mr-1" />
              <span>Absence de fuite</span>
            </div>
            {compliance.refrigerantLeak ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Snowflake className="h-4 w-4 text-blue-500 mr-1" />
              <span>Absence de givre</span>
            </div>
            {compliance.frost ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          {compliance.safetySystem !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 text-green-500 mr-1" />
                <span>Systèmes de sécurité</span>
              </div>
              {compliance.safetySystem ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
          
          {compliance.cleaningProcedures !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>Procédures de nettoyage</span>
              </div>
              {compliance.cleaningProcedures ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Thermometer = (props: any) => (
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
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);

export default HaccpComplianceCard;