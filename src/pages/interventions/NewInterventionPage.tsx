import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/axios';
import { InterventionFormData } from '../../types/intervention';

const NewInterventionPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<InterventionFormData>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createIntervention = useMutation({
    mutationFn: async (data: InterventionFormData) => {
      const response = await api.post('/interventions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Intervention créée avec succès');
      navigate('/interventions');
    },
  });

  const onSubmit = (data: InterventionFormData) => {
    createIntervention.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle intervention</h1>
        <p className="text-gray-600">Créez une nouvelle demande d'intervention</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type d'intervention</label>
              <select
                {...register('type', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="repair">Réparation</option>
                <option value="maintenance">Maintenance</option>
                <option value="installation">Installation</option>
                <option value="audit">Audit</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <select
                {...register('category', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="cold_storage">Froid commercial</option>
                <option value="vmc">VMC</option>
                <option value="haccp">HACCP</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priorité</label>
              <select
                {...register('priority', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez une priorité</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date souhaitée</label>
              <input
                type="datetime-local"
                {...register('scheduledDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez le problème ou l'intervention requise..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/interventions')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createIntervention.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createIntervention.isPending ? 'Création...' : 'Créer l\'intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInterventionPage;