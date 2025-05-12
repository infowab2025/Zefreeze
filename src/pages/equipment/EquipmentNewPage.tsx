import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEquipment } from '../../hooks/useEquipment';
import { EquipmentFormData } from '../../types/equipment';
import { ArrowLeft, Save } from 'lucide-react';

const EquipmentNewPage = () => {
  const navigate = useNavigate();
  const { createEquipment } = useEquipment();

  const { register, handleSubmit, formState: { errors } } = useForm<EquipmentFormData>();

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      const result = await createEquipment.mutateAsync(data);
      navigate(`/dashboard/equipment/${result.id}`);
    } catch (error) {
      console.error('Failed to create equipment:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/equipment')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel équipement</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                {...register('name', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Chambre froide positive"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
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
              <label className="block text-sm font-medium text-gray-700">Marque</label>
              <input
                type="text"
                {...register('brand', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Carrier"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Modèle</label>
              <input
                type="text"
                {...register('model', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: XR500"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de série</label>
              <input
                type="text"
                {...register('serialNumber', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: SN123456789"
              />
              {errors.serialNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.serialNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'installation</label>
              <input
                type="date"
                {...register('installationDate', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.installationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.installationDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Site</label>
              <select
                {...register('locationId', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un site</option>
                <option value="1">Restaurant Le Provençal</option>
                <option value="2">Supermarché FraisMart</option>
                <option value="3">Hôtel Le Méridien</option>
              </select>
              {errors.locationId && (
                <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Spécifications techniques</h2>
            
            <div className="space-y-6">
              {/* Temperature Settings */}
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Température</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('specifications.temperature.min')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="-5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('specifications.temperature.max')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Power Settings */}
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Puissance</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Puissance (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('specifications.power')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="2.5"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Dimensions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Largeur (cm)</label>
                    <input
                      type="number"
                      {...register('specifications.dimensions.width')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hauteur (cm)</label>
                    <input
                      type="number"
                      {...register('specifications.dimensions.height')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="220"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profondeur (cm)</label>
                    <input
                      type="number"
                      {...register('specifications.dimensions.depth')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/equipment')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createEquipment.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {createEquipment.isPending ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentNewPage;