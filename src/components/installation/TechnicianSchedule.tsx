import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { TechnicianAvailability } from '../../types/installation';

interface TechnicianScheduleProps {
  technician: TechnicianAvailability;
  selectedDate?: string | null;
  onDateSelect: (date: string) => void;
}

const TechnicianSchedule: React.FC<TechnicianScheduleProps> = ({
  technician,
  selectedDate,
  onDateSelect,
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{technician.name}</h3>
          <p className="text-sm text-gray-500">{technician.expertise.join(', ')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Disponibilités
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {technician.availability.map((slot) => (
              <button
                key={slot.date}
                onClick={() => onDateSelect(slot.date)}
                className={`p-2 text-xs rounded-md text-center transition-colors ${
                  selectedDate === slot.date
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {format(new Date(slot.date), 'dd/MM')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Charge actuelle
          </h4>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {technician.currentLoad} intervention{technician.currentLoad !== 1 ? 's' : ''} en cours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianSchedule;