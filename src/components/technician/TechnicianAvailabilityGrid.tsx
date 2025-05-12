import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X } from 'lucide-react';
import { TechnicianAvailabilityDay } from '../../types/technician';

interface TechnicianAvailabilityGridProps {
  availability: TechnicianAvailabilityDay[];
  onAvailabilityChange: (availability: TechnicianAvailabilityDay[]) => void;
  startDate?: Date;
  numWeeks?: number;
}

const TechnicianAvailabilityGrid: React.FC<TechnicianAvailabilityGridProps> = ({
  availability,
  onAvailabilityChange,
  startDate = new Date(),
  numWeeks = 4
}) => {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Start from Monday
  
  // Generate dates for the grid
  const dates = [];
  for (let week = 0; week < numWeeks; week++) {
    const weekDates = [];
    for (let day = 0; day < 5; day++) { // Monday to Friday
      const date = addDays(weekStart, week * 7 + day);
      weekDates.push(date);
    }
    dates.push(weekDates);
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.some(a => a.date === dateStr && a.available);
  };

  const getSlotAvailability = (date: Date, slot: 'morning' | 'afternoon') => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = availability.find(a => a.date === dateStr);
    return day?.slots[slot] || false;
  };

  const toggleSlotAvailability = (date: Date, slot: 'morning' | 'afternoon') => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayIndex = availability.findIndex(a => a.date === dateStr);
    
    let updatedAvailability;
    
    if (dayIndex >= 0) {
      // Update existing day
      const updatedDay = {
        ...availability[dayIndex],
        slots: {
          ...availability[dayIndex].slots,
          [slot]: !availability[dayIndex].slots[slot]
        }
      };
      
      // Check if both slots are unavailable
      const bothSlotsUnavailable = !updatedDay.slots.morning && !updatedDay.slots.afternoon;
      
      if (bothSlotsUnavailable) {
        // Remove the day entirely
        updatedAvailability = availability.filter((_, i) => i !== dayIndex);
      } else {
        // Update the day
        updatedAvailability = [
          ...availability.slice(0, dayIndex),
          updatedDay,
          ...availability.slice(dayIndex + 1)
        ];
      }
    } else {
      // Add new day with the selected slot
      updatedAvailability = [
        ...availability,
        {
          date: dateStr,
          available: true,
          slots: {
            morning: slot === 'morning',
            afternoon: slot === 'afternoon'
          }
        }
      ];
    }
    
    onAvailabilityChange(updatedAvailability);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Semaine
            </th>
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, index) => (
              <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dates.map((week, weekIndex) => (
            <React.Fragment key={`week-${weekIndex}`}>
              {/* Morning row */}
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Semaine {weekIndex + 1}<br />
                  <span className="text-xs text-gray-500">Matin</span>
                </td>
                {week.map((date) => (
                  <td key={`morning-${date.toISOString()}`} className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {format(date, 'dd/MM')}
                      </div>
                      <button
                        onClick={() => toggleSlotAvailability(date, 'morning')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          getSlotAvailability(date, 'morning')
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {getSlotAvailability(date, 'morning') ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
              {/* Afternoon row */}
              <tr className="bg-blue-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className="text-xs text-gray-500">Après-midi</span>
                </td>
                {week.map((date) => (
                  <td key={`afternoon-${date.toISOString()}`} className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleSlotAvailability(date, 'afternoon')}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          getSlotAvailability(date, 'afternoon')
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {getSlotAvailability(date, 'afternoon') ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicianAvailabilityGrid;