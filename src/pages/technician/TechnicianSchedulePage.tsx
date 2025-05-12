import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Save, Check, Clock, Calendar, User, MapPin, PenTool as Tool, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface TechnicianDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  department?: string;
  specialties?: string[];
}

interface AvailabilityDay {
  date: string;
  available: boolean;
  slots: {
    morning: boolean;
    afternoon: boolean;
  };
}

interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'intervention' | 'installation' | 'maintenance';
  location: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const TechnicianSchedulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [technician, setTechnician] = useState<TechnicianDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon' | null>(null);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch technician details
        const { data: techData, error: techError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        
        if (techError) throw techError;
        
        // Format technician data
        setTechnician({
          id: techData.id,
          name: techData.name,
          email: techData.email,
          phone: techData.phone || '',
          department: techData.metadata?.department,
          specialties: techData.metadata?.specialties || []
        });
        
        // Fetch availability
        const { data: availData, error: availError } = await supabase
          .from('technician_availability')
          .select('*')
          .eq('technician_id', id);
        
        if (availError) {
          console.error('Error fetching availability:', availError);
          // If no availability data exists, create default availability
          const defaultAvailability: AvailabilityDay[] = [];
          const today = new Date();
          
          for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Skip weekends (0 = Sunday, 6 = Saturday)
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
            
            defaultAvailability.push({
              date: date.toISOString().split('T')[0],
              available: true,
              slots: {
                morning: true,
                afternoon: true
              }
            });
          }
          
          setAvailability(defaultAvailability);
        } else {
          setAvailability(availData || []);
        }
        
        // Fetch scheduled events (interventions and installations)
        const { data: interventions, error: intError } = await supabase
          .from('interventions')
          .select(`
            id, type, scheduled_date, status, description, company:companies(name, address)
          `)
          .eq('technician_id', id)
          .gte('scheduled_date', startOfMonth(currentDate).toISOString())
          .lte('scheduled_date', endOfMonth(currentDate).toISOString());
        
        if (intError) throw intError;
        
        // Format scheduled events
        const events: ScheduledEvent[] = (interventions || []).map(int => ({
          id: int.id,
          title: int.description.substring(0, 30) + (int.description.length > 30 ? '...' : ''),
          date: new Date(int.scheduled_date),
          startTime: format(new Date(int.scheduled_date), 'HH:mm'),
          endTime: format(new Date(new Date(int.scheduled_date).getTime() + 2 * 60 * 60 * 1000), 'HH:mm'),
          type: int.type as 'intervention' | 'installation' | 'maintenance',
          location: int.company?.address || 'Adresse non spécifiée',
          status: int.status as 'pending' | 'in_progress' | 'completed'
        }));
        
        setScheduledEvents(events);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTechnicianData();
  }, [id, currentDate]);

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
    
    setAvailability(updatedAvailability);
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
    
    setAvailability(updatedAvailability);
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

  const handleSaveAvailability = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      // First delete existing availability records
      const { error: deleteError } = await supabase
        .from('technician_availability')
        .delete()
        .eq('technician_id', id);
      
      if (deleteError) throw deleteError;
      
      // Then insert new availability records
      if (availability.length > 0) {
        const availabilityWithTechId = availability.map(a => ({
          ...a,
          technician_id: id
        }));
        
        const { error: insertError } = await supabase
          .from('technician_availability')
          .insert(availabilityWithTechId);
        
        if (insertError) throw insertError;
      }
      
      toast.success('Disponibilités enregistrées avec succès');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Erreur lors de l\'enregistrement des disponibilités');
    } finally {
      setIsSaving(false);
    }
  };

  const getEventsByDate = (date: Date) => {
    return scheduledEvents.filter(event => 
      isSameDay(event.date, date)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Technicien non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planning du technicien</h1>
            <p className="text-gray-600">{technician.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technician Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{technician.name}</h3>
                  <p className="text-sm text-gray-500">{technician.department || 'Département non assigné'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{technician.email}</span>
                </div>
                {technician.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{technician.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Tool className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-700">Spécialités:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {technician.specialties?.map((specialty, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      )) || (
                        <span className="text-sm text-gray-500">Non spécifiées</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Interventions à venir</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {scheduledEvents.length > 0 ? (
                  scheduledEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-4 rounded-lg ${
                        event.status === 'pending' ? 'bg-yellow-50' :
                        event.status === 'in_progress' ? 'bg-blue-50' :
                        'bg-green-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`mt-1 mr-3 ${
                          event.type === 'intervention' ? 'text-blue-500' :
                          event.type === 'installation' ? 'text-green-500' :
                          'text-purple-500'
                        }`}>
                          <Tool className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {event.status === 'pending' ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : event.status === 'in_progress' ? (
                                <Tool className="h-3 w-3 mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {event.status === 'pending' ? 'À faire' :
                               event.status === 'in_progress' ? 'En cours' :
                               'Terminée'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{format(event.date, 'dd/MM/yyyy')}</span>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucune intervention planifiée
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Calendrier de disponibilité</h2>
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
                  const events = getEventsByDate(day);
                  const hasEvents = events.length > 0;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        h-12 flex flex-col items-center justify-center relative cursor-pointer
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
                      {hasEvents && (
                        <div className="absolute top-1 right-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
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

                  {/* Events for selected date */}
                  {getEventsByDate(selectedDate).length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Interventions planifiées:</h5>
                      <div className="space-y-2">
                        {getEventsByDate(selectedDate).map(event => (
                          <div key={event.id} className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{event.startTime} - {event.endTime}:</span>
                            <span className="ml-1 font-medium">{event.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveAvailability}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Enregistré
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define missing components
const Mail = (props: any) => (
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
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Phone = (props: any) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default TechnicianSchedulePage;