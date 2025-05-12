import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { TechnicianAvailabilityDay } from '../../types/technician';

interface TechnicianAvailabilityCalendarProps {
  availability?: TechnicianAvailabilityDay[];
  onAvailabilityChange?: (availability: TechnicianAvailabilityDay[]) => void;
  readOnly?: boolean;
}

const TechnicianAvailabilityCalendar: React.FC<TechnicianAvailabilityCalendarProps> = ({
  availability = [],
  onAvailabilityChange,
  readOnly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon' | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.some(a => a.date === dateStr && a.available);
  };

  const getSlotAvailability = (date: Date, slot: 'morning' | 'afternoon') => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = availability.find(a => a.date === dateStr);
    return day?.slots[slot] || false;
  };

  const toggleDateAvailability = (date: Date) => {
    if (readOnly) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = isDateAvailable(date);
    
    let updatedAvailability;
    
    if (isAvailable) {
      // Remove date from availability
      updatedAvailability = availability.filter(a => a.date !== dateStr);
    } else {
      // Add date to availability
      updatedAvailability = [
        ...availability,
        {
          date: dateStr,
          available: true,
          slots: { morning: true, afternoon: true }
        }
      ];
    }
    
    onAvailabilityChange && onAvailabilityChange(updatedAvailability);
  };

  const toggleSlotAvailability = (date: Date, slot: 'morning' | 'afternoon') => {
    if (readOnly) return;
    
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
    
    onAvailabilityChange && onAvailabilityChange(updatedAvailability);
  };

  const handleDateClick = (date: Date) => {
    if (isSameMonth(date, currentDate)) {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };

  const handleSlotClick = (slot: 'morning' | 'afternoon') => {
    if (selectedDate) {
      setSelectedSlot(slot);
      toggleSlotAvailability(selectedDate, slot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Calendrier de disponibilité</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {Array(monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1)
            .fill(null)
            .map((_, index) => (
              <div key={`empty-start-${index}`} className="h-12"></div>
            ))}
            
          {daysInMonth.map(day => {
            const isAvailable = isDateAvailable(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  h-12 flex items-center justify-center relative cursor-pointer
                  ${!isSameMonth(day, currentDate) ? 'text-gray-300' : ''}
                  ${isToday(day) ? 'bg-blue-50' : ''}
                  ${isSelected ? 'bg-blue-100' : ''}
                  ${isAvailable ? 'font-bold' : ''}
                  rounded-md hover:bg-gray-100
                `}
              >
                <span className={isAvailable ? 'text-blue-600' : ''}>
                  {format(day, 'd')}
                </span>
                {isAvailable && (
                  <div className="absolute bottom-1 flex space-x-1">
                    <div className={`h-1 w-1 rounded-full ${getSlotAvailability(day, 'morning') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 w-1 rounded-full ${getSlotAvailability(day, 'afternoon') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                )}
              </div>
            );
          })}
          
          {Array((7 - ((monthEnd.getDay() === 0 ? 7 : monthEnd.getDay()))) % 7)
            .fill(null)
            .map((_, index) => (
              <div key={`empty-end-${index}`} className="h-12"></div>
            ))}
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <div className="mt-6 p-4 border rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h4>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleSlotClick('morning')}
                className={`
                  flex-1 py-2 px-4 rounded-md text-sm
                  ${getSlotAvailability(selectedDate, 'morning')
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }
                `}
              >
                {getSlotAvailability(selectedDate, 'morning') && (
                  <Check className="h-4 w-4 inline mr-1" />
                )}
                Matin (8h-12h)
              </button>
              
              <button
                onClick={() => handleSlotClick('afternoon')}
                className={`
                  flex-1 py-2 px-4 rounded-md text-sm
                  ${getSlotAvailability(selectedDate, 'afternoon')
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }
                `}
              >
                {getSlotAvailability(selectedDate, 'afternoon') && (
                  <Check className="h-4 w-4 inline mr-1" />
                )}
                Après-midi (13h-17h)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianAvailabilityCalendar;