import React from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, Building, PenTool as Tool, Send } from 'lucide-react';

interface InstallationRequestFormData {
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  preferredDate: string;
  equipment: {
    type: string;
    specifications: string;
  };
}

interface InstallationRequestFormProps {
  onSubmit: (data: InstallationRequestFormData) => Promise<void>;
  isSubmitting: boolean;
}

const InstallationRequestForm: React.FC<InstallationRequestFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InstallationRequestFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type d'installation</label>
          <select
            {...register('type', { required: 'Ce champ est requis' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Sélectionnez un type</option>
            <option value="cold_storage">Froid commercial</option>
            <option value="vmc">VMC</option>
            <option value="other">Autre</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date souhaitée</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              {...register('preferredDate')}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse d'installation</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            {...register('location.address', { required: 'Ce champ est requis' })}
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="123 Rue de Paris, 75001 Paris"
          />
        </div>
        {errors.location?.address && (
          <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Informations complémentaires sur le lieu</label>
        <textarea
          {...register('location.additionalInfo')}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Étage, code d'accès, contraintes particulières..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Spécifications techniques</label>
        <textarea
          {...register('equipment.specifications')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Dimensions, puissance, température requise..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description détaillée</label>
        <textarea
          {...register('description', { required: 'Ce champ est requis' })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Décrivez vos besoins spécifiques..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
      </div>
    </form>
  );
};

export default InstallationRequestForm;