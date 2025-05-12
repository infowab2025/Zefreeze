import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'intervention' | 'installation' | 'maintenance';
  location: string;
}

interface TechnicianScheduleCalendarProps {
  events?: ScheduledEvent[];
  onEventClick?: (event: ScheduledEvent) => void;
}

const TechnicianScheduleCalendar: React.FC<TechnicianScheduleCalendarProps> = ({
  events = [],
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'week' | 'month'>('week');

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate });
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'intervention':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'installation':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'maintenance':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const navigatePrevious = () => {
    if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      // Handle month view navigation
    }
  };

  const navigateNext = () => {
    if (currentView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      // Handle month view navigation
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Planning</h3>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentView('week')}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentView === 'week' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setCurrentView('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentView === 'month' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mois
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={navigatePrevious}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm font-medium">
                {format(startDate, 'dd MMM', { locale: fr })} - {format(endDate, 'dd MMM yyyy', { locale: fr })}
              </span>
              <button
                onClick={navigateNext}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Week View */}
          {currentView === 'week' && (
            <div className="grid grid-cols-8 border-b">
              {/* Time column */}
              <div className="border-r">
                <div className="h-12 border-b"></div> {/* Empty cell for header row */}
                {timeSlots.map(time => (
                  <div key={time} className="h-16 border-b flex items-center justify-center">
                    <span className="text-xs text-gray-500">{time}</span>
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {daysInWeek.map(day => (
                <div key={day.toISOString()} className="border-r">
                  {/* Day header */}
                  <div className="h-12 border-b p-2 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {format(day, 'EEEE', { locale: fr })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(day, 'dd/MM')}
                    </div>
                  </div>

                  {/* Time slots */}
                  {timeSlots.map(time => {
                    const eventsAtTime = getEventsForDay(day).filter(
                      event => event.startTime === time
                    );

                    return (
                      <div key={`${day.toISOString()}-${time}`} className="h-16 border-b p-1 relative">
                        {eventsAtTime.map(event => (
                          <div
                            key={event.id}
                            onClick={() => onEventClick && onEventClick(event)}
                            className={`absolute inset-x-1 p-1 rounded border ${getEventStyle(event.type)} cursor-pointer`}
                            style={{
                              top: '4px',
                              height: 'calc(100% - 8px)',
                            }}
                          >
                            <div className="text-xs font-medium truncate">{event.title}</div>
                            <div className="text-xs flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.startTime}-{event.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Month View (simplified) */}
          {currentView === 'month' && (
            <div className="p-6 text-center">
              <p className="text-gray-500">Vue mensuelle en développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianScheduleCalendar;