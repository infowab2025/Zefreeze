import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { TechnicianAvailability } from '../../types/installation';

interface TechnicianAvailabilityCalendarProps {
  technician: TechnicianAvailability;
  selectedDate?: string | null;
  onDateSelect: (date: string) => void;
}

const TechnicianAvailabilityCalendar: React.FC<TechnicianAvailabilityCalendarProps> = ({
  technician,
  selectedDate,
  onDateSelect,
}) => {
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));

  const isSlotAvailable = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const availability = technician.availability.find(a => a.date === dateStr);
    if (!availability) return false;

    const hour = parseInt(time.split(':')[0], 10);
    return hour < 12 
      ? availability.slots.includes('morning')
      : availability.slots.includes('afternoon');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Disponibilités</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{technician.currentLoad} intervention(s) en cours</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1"></div>
          {weekDays.map((date) => (
            <div key={date.toISOString()} className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {format(date, 'EEE', { locale: fr })}
              </div>
              <div className="text-sm text-gray-500">
                {format(date, 'dd/MM')}
              </div>
            </div>
          ))}

          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="text-sm text-gray-500 text-right pr-4">
                {time}
              </div>
              {weekDays.map((date) => {
                const isAvailable = isSlotAvailable(date, time);
                const dateStr = format(date, 'yyyy-MM-dd');
                const timeStr = `${dateStr}T${time}:00`;
                const isSelected = selectedDate === timeStr;

                return (
                  <button
                    key={`${date.toISOString()}-${time}`}
                    onClick={() => isAvailable && onDateSelect(timeStr)}
                    disabled={!isAvailable}
                    className={`
                      rounded-md p-2 text-center transition-colors
                      ${isSelected 
                        ? 'bg-blue-500 text-white' 
                        : isAvailable 
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }
                    `}
                  >
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 mx-auto" />
                    ) : (
                      <Calendar className="h-4 w-4 mx-auto" />
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicianAvailabilityCalendar;