import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Save, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AvailabilityFormData {
  startDate: string;
  endDate: string;
  availableDays: string[];
  availableSlots: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
    };
  };
  notes: string;
}

const TechnicianAvailabilityForm: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AvailabilityFormData>({
    defaultValues: {
      startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      availableDays: [],
      availableSlots: {},
      notes: ''
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const availableDays = watch('availableDays');

  // Generate array of dates between start and end
  const dateRange = startDate && endDate 
    ? eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate)
      })
    : [];

  const toggleAllDays = (checked: boolean) => {
    if (checked) {
      setValue('availableDays', dateRange.map(date => format(date, 'yyyy-MM-dd')));
    } else {
      setValue('availableDays', []);
    }
  };

  const toggleDaySlot = (date: string, slot: 'morning' | 'afternoon', checked: boolean) => {
    setValue(`availableSlots.${date}.${slot}`, checked);
  };

  const onSubmit = async (data: AvailabilityFormData) => {
    try {
      // In a real app, this would be an API call to save the availability
      console.log('Saving availability:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Disponibilités enregistrées avec succès');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast.error('Erreur lors de l\'enregistrement des disponibilités');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              {...register('startDate', { required: 'Ce champ est requis' })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              {...register('endDate', { required: 'Ce champ est requis' })}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Sélection des jours disponibles</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="selectAll"
              checked={availableDays.length === dateRange.length}
              onChange={(e) => toggleAllDays(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="selectAll" className="ml-2 block text-sm text-gray-900">
              Sélectionner tous les jours
            </label>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
            <div key={`header-${i}`} className="text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {dateRange.map((date, i) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = availableDays.includes(dateStr);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            return (
              <div 
                key={dateStr}
                className={`
                  p-2 rounded-md text-center cursor-pointer
                  ${isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 border border-gray-200'}
                  ${isWeekend ? 'opacity-50' : ''}
                `}
              >
                <div className="text-sm font-medium">{format(date, 'd')}</div>
                <div className="text-xs text-gray-500">{format(date, 'MMM', { locale: fr })}</div>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    id={`day-${dateStr}`}
                    value={dateStr}
                    {...register('availableDays')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Créneaux horaires disponibles</h3>
        <div className="space-y-4">
          {availableDays.map(dateStr => (
            <div key={`slots-${dateStr}`} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <div className="w-32 font-medium">{format(new Date(dateStr), 'EEEE dd/MM', { locale: fr })}</div>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={watch(`availableSlots.${dateStr}.morning`) || false}
                    onChange={(e) => toggleDaySlot(dateStr, 'morning', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Matin (8h-12h)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={watch(`availableSlots.${dateStr}.afternoon`) || false}
                    onChange={(e) => toggleDaySlot(dateStr, 'afternoon', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Après-midi (13h-17h)</span>
                </label>
              </div>
            </div>
          ))}
          
          {availableDays.length === 0 && (
            <p className="text-sm text-gray-500 italic">Veuillez sélectionner au moins un jour disponible</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (congés, contraintes particulières...)</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Ex: Indisponible le matin du 15/05 pour formation"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
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
              Enregistrer mes disponibilités
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TechnicianAvailabilityForm;