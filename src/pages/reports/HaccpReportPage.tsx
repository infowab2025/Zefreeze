import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  ArrowLeft, Save, Upload, Camera, 
  Thermometer, CheckCircle, XCircle, 
  Droplet, Snowflake, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReports } from '../../hooks/useReports';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';
import ComplianceCheckItem from '../../components/reports/ComplianceCheckItem';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface HaccpReportFormData {
  interventionId?: string;
  equipmentId: string;
  temperature: {
    before: number;
    after: number;
  };
  compliance: {
    haccp: boolean;
    refrigerantLeak: boolean;
    frost: boolean;
    safetySystem: boolean;
    cleaningProcedures: boolean;
  };
  notes: string;
  recommendations?: string;
  photos?: File[];
  correctiveActions?: string;
  nextInspectionDate?: string;
}

const HaccpReportPage = () => {
  const navigate = useNavigate();
  const { createReport } = useReports();
  const { user } = useAuth();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<HaccpReportFormData>({
    defaultValues: {
      temperature: {
        before: 0,
        after: 0
      },
      compliance: {
        haccp: false,
        refrigerantLeak: false,
        frost: false,
        safetySystem: false,
        cleaningProcedures: false
      }
    }
  });

  React.useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await supabase
          .from('equipment')
          .select('*');
        
        if (data) {
          setEquipment(data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Erreur lors du chargement des équipements');
      }
    };

    fetchEquipment();
  }, []);

  const handlePhotoUpload = (photos: File[]) => {
    setUploadedPhotos(photos);
  };

  const watchCompliance = watch('compliance');
  const isCompliant = Object.values(watchCompliance).every(value => value === true);

  const onSubmit = async (data: HaccpReportFormData) => {
    setIsSubmitting(true);
    try {
      // Add photos to form data
      const formData = {
        ...data,
        type: 'haccp',
        photos: uploadedPhotos,
        technicianId: user?.id,
        status: 'draft'
      };
      
      await createReport.mutateAsync(formData);
      toast.success('Rapport HACCP créé avec succès');
      navigate('/dashboard/reports');
    } catch (error) {
      console.error('Failed to create HACCP report:', error);
      toast.error('Erreur lors de la création du rapport HACCP');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Rapport de contrôle HACCP</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Équipement</label>
            <select
              {...register('equipmentId', { required: 'Ce champ est requis' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un équipement</option>
              {equipment.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.type === 'cold_storage' ? 'Froid' : item.type === 'vmc' ? 'VMC' : 'Autre'}
                </option>
              ))}
            </select>
            {errors.equipmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.equipmentId.message}</p>
            )}
          </div>

          {/* Temperature Readings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Thermometer className="inline-block h-4 w-4 mr-1" />
                Température avant (°C)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  {...register('temperature.before', { required: 'Ce champ est requis' })}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">°C</span>
                </div>
              </div>
              {errors.temperature?.before && (
                <p className="mt-1 text-sm text-red-600">{errors.temperature.before.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Thermometer className="inline-block h-4 w-4 mr-1" />
                Température après (°C)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  {...register('temperature.after', { required: 'Ce champ est requis' })}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">°C</span>
                </div>
              </div>
              {errors.temperature?.after && (
                <p className="mt-1 text-sm text-red-600">{errors.temperature.after.message}</p>
              )}
            </div>
          </div>

          {/* HACCP Compliance Checklist */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Conformité HACCP</h3>
            <div className="space-y-4">
              <ComplianceCheckItem
                label="Conforme aux normes HACCP"
                isCompliant={watchCompliance.haccp}
                icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
                onChange={(value) => {
                  const compliance = { ...watchCompliance, haccp: value };
                  setValue('compliance', compliance);
                }}
              />
              
              <ComplianceCheckItem
                label="Absence de fuite de fluide frigorigène"
                isCompliant={watchCompliance.refrigerantLeak}
                icon={<Droplet className="h-5 w-5 text-blue-500" />}
                onChange={(value) => {
                  const compliance = { ...watchCompliance, refrigerantLeak: value };
                  setValue('compliance', compliance);
                }}
              />
              
              <ComplianceCheckItem
                label="Absence de givre"
                isCompliant={watchCompliance.frost}
                icon={<Snowflake className="h-5 w-5 text-blue-500" />}
                onChange={(value) => {
                  const compliance = { ...watchCompliance, frost: value };
                  setValue('compliance', compliance);
                }}
              />
              
              <ComplianceCheckItem
                label="Systèmes de sécurité fonctionnels"
                isCompliant={watchCompliance.safetySystem}
                icon={<ShieldCheck className="h-5 w-5 text-green-500" />}
                onChange={(value) => {
                  const compliance = { ...watchCompliance, safetySystem: value };
                  setValue('compliance', compliance);
                }}
              />
              
              <ComplianceCheckItem
                label="Procédures de nettoyage respectées"
                isCompliant={watchCompliance.cleaningProcedures}
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                onChange={(value) => {
                  const compliance = { ...watchCompliance, cleaningProcedures: value };
                  setValue('compliance', compliance);
                }}
              />
            </div>
            
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center">
                {isCompliant ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">
                  {isCompliant ? 'Équipement conforme' : 'Équipement non conforme'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes d'inspection</label>
            <textarea
              {...register('notes', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Détails de l'inspection HACCP..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {!isCompliant && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Actions correctives</label>
              <textarea
                {...register('correctiveActions', { required: !isCompliant ? 'Ce champ est requis' : false })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Actions à mettre en place pour corriger les non-conformités..."
              />
              {errors.correctiveActions && (
                <p className="mt-1 text-sm text-red-600">{errors.correctiveActions.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Recommandations</label>
            <textarea
              {...register('recommendations')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Recommandations pour améliorer la conformité HACCP..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de la prochaine inspection</label>
            <input
              type="date"
              {...register('nextInspectionDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
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

export default HaccpReportPage;