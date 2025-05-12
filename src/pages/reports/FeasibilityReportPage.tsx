import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, Save, Upload, Camera, 
  Building, MapPin, Wrench, FileText,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';

interface FeasibilityReportFormData {
  clientId: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  projectType: 'cold_storage' | 'vmc' | 'other';
  projectDescription: string;
  technicalConditions: {
    electricalSupply: boolean;
    waterSupply: boolean;
    spaceAvailability: boolean;
    accessConditions: boolean;
    structuralConstraints: boolean;
  };
  recommendations: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  feasibilityScore: 'high' | 'medium' | 'low';
  notes?: string;
}

const FeasibilityReportPage = () => {
  const navigate = useNavigate();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FeasibilityReportFormData>({
    defaultValues: {
      technicalConditions: {
        electricalSupply: false,
        waterSupply: false,
        spaceAvailability: false,
        accessConditions: false,
        structuralConstraints: false
      },
      feasibilityScore: 'medium'
    }
  });

  const handlePhotoUpload = (photos: File[]) => {
    setUploadedPhotos(photos);
  };

  const onSubmit = async (data: FeasibilityReportFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send data to the database
      console.log('Submitting feasibility report:', { ...data, photos: uploadedPhotos });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Rapport de faisabilité créé avec succès');
      navigate('/dashboard/reports');
    } catch (error) {
      console.error('Failed to create feasibility report:', error);
      toast.error('Erreur lors de la création du rapport de faisabilité');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchTechnicalConditions = watch('technicalConditions');
  const allConditionsMet = Object.values(watchTechnicalConditions).every(value => value === true);
  const feasibilityScore = watch('feasibilityScore');

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Rapport de faisabilité</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Client and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                {...register('clientId', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un client</option>
                <option value="1">Restaurant Le Provençal</option>
                <option value="2">Supermarché FraisMart</option>
                <option value="3">Hôtel Le Méridien</option>
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type de projet</label>
              <select
                {...register('projectType', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un type</option>
                <option value="cold_storage">Installation froid commercial</option>
                <option value="vmc">Installation VMC</option>
                <option value="other">Autre installation</option>
              </select>
              {errors.projectType && (
                <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
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

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description du projet</label>
            <textarea
              {...register('projectDescription', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez le projet d'installation en détail..."
            />
            {errors.projectDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.projectDescription.message}</p>
            )}
          </div>

          {/* Technical Conditions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conditions techniques</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="electricalSupply"
                  {...register('technicalConditions.electricalSupply')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="electricalSupply" className="ml-2 block text-sm text-gray-900">
                  Alimentation électrique adéquate
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="waterSupply"
                  {...register('technicalConditions.waterSupply')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="waterSupply" className="ml-2 block text-sm text-gray-900">
                  Alimentation en eau disponible
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="spaceAvailability"
                  {...register('technicalConditions.spaceAvailability')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="spaceAvailability" className="ml-2 block text-sm text-gray-900">
                  Espace disponible suffisant
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="accessConditions"
                  {...register('technicalConditions.accessConditions')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="accessConditions" className="ml-2 block text-sm text-gray-900">
                  Conditions d'accès favorables
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="structuralConstraints"
                  {...register('technicalConditions.structuralConstraints')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="structuralConstraints" className="ml-2 block text-sm text-gray-900">
                  Absence de contraintes structurelles
                </label>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center">
                {allConditionsMet ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {allConditionsMet 
                    ? 'Toutes les conditions techniques sont remplies' 
                    : 'Certaines conditions techniques ne sont pas remplies'}
                </span>
              </div>
            </div>
          </div>

          {/* Feasibility Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Score de faisabilité</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="high"
                  value="high"
                  {...register('feasibilityScore')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="high" className="ml-2 block text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                    Élevé
                  </span>
                  Projet facilement réalisable, aucun obstacle majeur
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="medium"
                  value="medium"
                  {...register('feasibilityScore')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="medium" className="ml-2 block text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                    Moyen
                  </span>
                  Projet réalisable avec quelques adaptations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="low"
                  value="low"
                  {...register('feasibilityScore')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="low" className="ml-2 block text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                    Faible
                  </span>
                  Projet difficile à réaliser, obstacles majeurs identifiés
                </label>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Recommandations techniques</label>
            <textarea
              {...register('recommendations', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Recommandations techniques pour la réalisation du projet..."
            />
            {errors.recommendations && (
              <p className="mt-1 text-sm text-red-600">{errors.recommendations.message}</p>
            )}
          </div>

          {/* Cost and Duration Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coût estimé (€)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="100"
                  {...register('estimatedCost', { min: 0 })}
                  className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Durée estimée (jours)</label>
              <input
                type="number"
                min="1"
                step="1"
                {...register('estimatedDuration', { min: 1 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes additionnelles</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos du site</label>
            <ReportPhotoUploader
              onPhotosSelected={handlePhotoUpload}
              maxPhotos={10}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeasibilityReportPage;