import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Upload, Trash2, Camera, Thermometer, CheckCircle, XCircle, Droplet, Snowflake, ShieldCheck } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { ReportFormData } from '../../types/report';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ReportNewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { interventionId } = useParams<{ interventionId: string }>();
  const { createReport } = useReports();
  const { user } = useAuth();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    defaultValues: {
      type: 'intervention',
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
      },
      technicianId: user?.id,
      status: 'draft'
    }
  });

  const reportType = watch('type');
  const watchCompliance = watch('compliance');
  const isCompliant = Object.values(watchCompliance || {}).every(value => value === true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch equipment
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('*');
        
        if (equipmentData) {
          setEquipment(equipmentData);
        }

        // Fetch interventions
        const { data: interventionsData } = await supabase
          .from('interventions')
          .select('*');
        
        if (interventionsData) {
          setInterventions(interventionsData);
        }

        // Fetch companies
        const { data: companiesData } = await supabase
          .from('companies')
          .select('*');
        
        if (companiesData) {
          setCompanies(companiesData);
        }

        // If interventionId is provided, pre-fill form
        if (interventionId) {
          const { data: intervention } = await supabase
            .from('interventions')
            .select('*')
            .eq('id', interventionId)
            .single();
          
          if (intervention) {
            setValue('interventionId', intervention.id);
            setValue('clientId', intervention.company_id);
            setValue('technicianId', intervention.technician_id || user?.id);
            
            if (intervention.equipment_id) {
              setValue('equipmentId', intervention.equipment_id);
            }
            
            if (intervention.temperature_before) {
              setValue('temperature.before', intervention.temperature_before);
            }
            
            if (intervention.temperature_after) {
              setValue('temperature.after', intervention.temperature_after);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchData();
  }, [interventionId, setValue, user?.id]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newPhotos = Array.from(files);
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    
    // Create preview URLs
    const newPreviewUrls = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      // Add photos to form data
      const formData = {
        ...data,
        photos: uploadedPhotos
      };
      
      await createReport.mutateAsync(formData);
      toast.success('Rapport créé avec succès');
      navigate('/dashboard/reports');
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error('Erreur lors de la création du rapport');
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
          <h1 className="text-2xl font-bold text-gray-900">Nouveau rapport</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de rapport</label>
              <select
                {...register('type', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="intervention">Intervention</option>
                <option value="haccp">HACCP</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Intervention</label>
              <select
                {...register('interventionId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez une intervention</option>
                {interventions.map(intervention => (
                  <option key={intervention.id} value={intervention.id}>
                    {intervention.description.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Équipement</label>
              <select
                {...register('equipmentId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un équipement</option>
                {equipment.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                {...register('clientId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un client</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                  {...register('temperature.before')}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">°C</span>
                </div>
              </div>
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
                  {...register('temperature.after')}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">°C</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes techniques</label>
            <textarea
              {...register('notes', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Détails de l'intervention..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Recommandations</label>
            <textarea
              {...register('recommendations')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Recommandations pour le client..."
            />
          </div>

          {/* HACCP Compliance Checklist - Only show for HACCP reports */}
          {reportType === 'haccp' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conformité HACCP</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Controller
                    name="compliance.haccp"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="haccp"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="haccp" className="ml-2 block text-sm text-gray-900">
                    <ShieldCheck className="inline-block h-4 w-4 mr-1 text-blue-500" />
                    Conforme aux normes HACCP
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Controller
                    name="compliance.refrigerantLeak"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="refrigerantLeak"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="refrigerantLeak" className="ml-2 block text-sm text-gray-900">
                    <Droplet className="inline-block h-4 w-4 mr-1 text-blue-500" />
                    Absence de fuite de fluide frigorigène
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Controller
                    name="compliance.frost"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="frost"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="frost" className="ml-2 block text-sm text-gray-900">
                    <Snowflake className="inline-block h-4 w-4 mr-1 text-blue-500" />
                    Absence de givre
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Controller
                    name="compliance.safetySystem"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="safetySystem"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="safetySystem" className="ml-2 block text-sm text-gray-900">
                    <ShieldCheck className="inline-block h-4 w-4 mr-1 text-green-500" />
                    Systèmes de sécurité fonctionnels
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Controller
                    name="compliance.cleaningProcedures"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="cleaningProcedures"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label htmlFor="cleaningProcedures" className="ml-2 block text-sm text-gray-900">
                    <CheckCircle className="inline-block h-4 w-4 mr-1 text-green-500" />
                    Procédures de nettoyage respectées
                  </label>
                </div>
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
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            
            {/* Photo previews */}
            {photoPreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Photo upload */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="photos"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Télécharger des photos</span>
                    <input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
              </div>
            </div>
            
            {/* Camera capture button for mobile */}
            <div className="mt-4 text-center">
              <label
                htmlFor="camera-capture"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo
                <input
                  id="camera-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handlePhotoUpload}
                />
              </label>
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
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Création...' : 'Créer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportNewPage;