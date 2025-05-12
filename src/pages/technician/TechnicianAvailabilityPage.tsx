import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TechnicianAvailabilityCalendar from '../../components/technician/TechnicianAvailabilityCalendar';
import TechnicianScheduleCalendar from '../../components/technician/TechnicianScheduleCalendar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TechnicianAvailabilityDay } from '../../types/technician';

const TechnicianAvailabilityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availability, setAvailability] = useState<TechnicianAvailabilityDay[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load technician's availability when component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('technician_availability')
          .select('*')
          .eq('technician_id', user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setAvailability(data);
        } else {
          // If no availability data exists, create default availability for next 14 days
          const defaultAvailability: TechnicianAvailabilityDay[] = [];
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
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        toast.error('Erreur lors du chargement des disponibilités');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user?.id]);

  const handleAvailabilityChange = (newAvailability: TechnicianAvailabilityDay[]) => {
    setAvailability(newAvailability);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Utilisateur non authentifié');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // First, delete existing availability records
      const { error: deleteError } = await supabase
        .from('technician_availability')
        .delete()
        .eq('technician_id', user.id);
      
      if (deleteError) throw deleteError;
      
      // Then insert new availability records
      if (availability.length > 0) {
        const availabilityWithTechId = availability.map(a => ({
          ...a,
          technician_id: user.id
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
      console.error('Failed to save availability:', error);
      toast.error('Erreur lors de l\'enregistrement des disponibilités');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock scheduled events for the calendar
  const scheduledEvents = [
    {
      id: '1',
      title: 'Installation VMC',
      date: new Date(2025, 4, 15), // May 15, 2025
      startTime: '09:00',
      endTime: '11:00',
      type: 'installation',
      location: 'Hôtel Le Méridien'
    },
    {
      id: '2',
      title: 'Maintenance Chambre Froide',
      date: new Date(2025, 4, 16), // May 16, 2025
      startTime: '14:00',
      endTime: '16:00',
      type: 'maintenance',
      location: 'Restaurant Le Provençal'
    },
    {
      id: '3',
      title: 'Réparation Urgente',
      date: new Date(2025, 4, 17), // May 17, 2025
      startTime: '10:00',
      endTime: '12:00',
      type: 'intervention',
      location: 'Supermarché FraisMart'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/technician')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des disponibilités</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Définir mes disponibilités</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez les jours et créneaux où vous êtes disponible pour des interventions.
                Cliquez sur une date puis choisissez les créneaux horaires disponibles.
              </p>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <TechnicianAvailabilityCalendar
                  availability={availability}
                  onAvailabilityChange={handleAvailabilityChange}
                />
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
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
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Légende</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                  <span className="text-sm">Date sélectionnée</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Créneau disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                  <span className="text-sm">Créneau indisponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-50 mr-2"></div>
                  <span className="text-sm">Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <TechnicianScheduleCalendar events={scheduledEvents} />
        </div>
      </div>
    </div>
  );
};

export default TechnicianAvailabilityPage;