import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Camera, Thermometer, CheckCircle, XCircle, PenTool as Tool, FileText, User, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReports } from '../../hooks/useReports';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';
import SignatureCanvas from '../../components/reports/SignatureCanvas';

interface InstallationReportFormData {
  interventionId?: string;
  equipmentId: string;
  installationType: 'cold_storage' | 'vmc' | 'other';
  workPerformed: string;
  partsReplaced?: string;
  temperature?: {
    before?: number;
    after: number;
  };
  notes: string;
  recommendations?: string;
  clientFeedback?: string;
  technicianSignature: string | null;
  clientSignature: string | null;
}

const InstallationReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createReport, signReport } = useReports();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<InstallationReportFormData>({
    defaultValues: {
      installationType: 'cold_storage',
      temperature: {
        after: 0
      }
    }
  });

  const handlePhotoUpload = (photos: File[]) => {
    setUploadedPhotos(photos);
  };

  const onSubmit = async (data: InstallationReportFormData) => {
    setIsSubmitting(true);
    try {
      if (!technicianSignature || !clientSignature) {
        toast.error('Les signatures du technicien et du client sont requises');
        return;
      }

      // Add photos and signatures to form data
      const formData = {
        ...data,
        type: 'intervention',
        photos: uploadedPhotos,
        technicianSignature,
        clientSignature
      };
      
      // In a real app, this would send data to the database
      console.log('Submitting installation report:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Rapport d\'installation créé avec succès');
      navigate('/dashboard/reports');
    } catch (error) {
      console.error('Failed to create installation report:', error);
      toast.error('Erreur lors de la création du rapport d\'installation');
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
          <h1 className="text-2xl font-bold text-gray-900">Rapport d'installation final</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Equipment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Équipement</label>
              <select
                {...register('equipmentId', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un équipement</option>
                <option value="1">Chambre froide positive</option>
                <option value="2">Chambre froide négative</option>
                <option value="3">Vitrine réfrigérée</option>
                <option value="4">Armoire réfrigérée</option>
                <option value="5">Système VMC cuisine</option>
              </select>
              {errors.equipmentId && (
                <p className="mt-1 text-sm text-red-600">{errors.equipmentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type d'installation</label>
              <select
                {...register('installationType', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="cold_storage">Froid commercial</option>
                <option value="vmc">VMC</option>
                <option value="other">Autre</option>
              </select>
              {errors.installationType && (
                <p className="mt-1 text-sm text-red-600">{errors.installationType.message}</p>
              )}
            </div>
          </div>

          {/* Work Performed */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Travaux réalisés</label>
            <textarea
              {...register('workPerformed', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez en détail les travaux d'installation réalisés..."
            />
            {errors.workPerformed && (
              <p className="mt-1 text-sm text-red-600">{errors.workPerformed.message}</p>
            )}
          </div>

          {/* Parts Replaced */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pièces installées</label>
            <textarea
              {...register('partsReplaced')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Liste des pièces et équipements installés..."
            />
          </div>

          {/* Temperature Readings (for cold storage) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Thermometer className="inline-block h-4 w-4 mr-1" />
                Température après installation (°C)
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

          {/* Notes and Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes techniques</label>
            <textarea
              {...register('notes', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Notes techniques sur l'installation..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recommandations</label>
            <textarea
              {...register('recommendations')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Recommandations pour l'utilisation et l'entretien..."
            />
          </div>

          {/* Client Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Retour client</label>
            <textarea
              {...register('clientFeedback')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Commentaires et feedback du client..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos de l'installation</label>
            <ReportPhotoUploader
              onPhotosSelected={handlePhotoUpload}
              maxPhotos={10}
            />
          </div>

          {/* Signatures */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Tool className="h-5 w-5 text-gray-400 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">Signature du technicien</label>
                </div>
                <SignatureCanvas 
                  onSignatureChange={setTechnicianSignature}
                  width={400}
                  height={200}
                />
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">Signature du client</label>
                </div>
                <SignatureCanvas 
                  onSignatureChange={setClientSignature}
                  width={400}
                  height={200}
                />
              </div>
            </div>
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
              disabled={isSubmitting || !technicianSignature || !clientSignature}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Finaliser l\'installation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstallationReportPage;