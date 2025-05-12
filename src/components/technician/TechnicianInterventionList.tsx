import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, PenTool as Tool, CheckCircle, AlertTriangle } from 'lucide-react';

interface Intervention {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'intervention' | 'installation' | 'maintenance';
  location: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TechnicianInterventionListProps {
  interventions: Intervention[];
  emptyMessage?: string;
}

const TechnicianInterventionList: React.FC<TechnicianInterventionListProps> = ({
  interventions,
  emptyMessage = "Aucune intervention planifiée"
}) => {
  if (interventions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // Group interventions by date
  const groupedInterventions = interventions.reduce((groups, intervention) => {
    const dateStr = format(intervention.date, 'yyyy-MM-dd');
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(intervention);
    return groups;
  }, {} as Record<string, Intervention[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedInterventions).map(([dateStr, dayInterventions]) => (
        <div key={dateStr} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            {format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          
          <div className="space-y-3">
            {dayInterventions.map((intervention) => (
              <div 
                key={intervention.id} 
                className={`p-4 rounded-lg ${
                  intervention.status === 'pending' ? 'bg-yellow-50 border border-yellow-100' :
                  intervention.status === 'in_progress' ? 'bg-blue-50 border border-blue-100' :
                  'bg-green-50 border border-green-100'
                }`}
              >
                <div className="flex items-start">
                  <div className={`mt-1 mr-3 ${
                    intervention.type === 'intervention' ? 'text-blue-500' :
                    intervention.type === 'installation' ? 'text-green-500' :
                    'text-purple-500'
                  }`}>
                    <Tool className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{intervention.title}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        intervention.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {intervention.status === 'pending' ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : intervention.status === 'in_progress' ? (
                          <Tool className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {intervention.status === 'pending' ? 'À faire' :
                         intervention.status === 'in_progress' ? 'En cours' :
                         'Terminée'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{intervention.startTime} - {intervention.endTime}</span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{intervention.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicianInterventionList;