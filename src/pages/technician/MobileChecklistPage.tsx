import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Camera, Thermometer, CheckCircle, XCircle, PenTool as Tool, FileText, Clock, Calendar, ThermometerSnowflake, Fan, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';

interface ChecklistFormData {
  interventionId: string;
  equipmentId: string;
  checksBefore: {
    visualInspection: boolean;
    temperatureCheck: boolean;
    noiseCheck: boolean;
    leakCheck: boolean;
    filterCheck: boolean;
  };
  checksAfter: {
    visualInspection: boolean;
    temperatureCheck: boolean;
    noiseCheck: boolean;
    leakCheck: boolean;
    filterCheck: boolean;
  };
  temperature: {
    before: number;
    after: number;
  };
  workPerformed: string;
  partsReplaced?: string;
  notes?: string;
  duration: number;
}

const MobileChecklistPage = () => {
  const { interventionId } = useParams<{ interventionId: string }>();
  const navigate = useNavigate();
  const [uploadedPhotosBefore, setUploadedPhotosBefore] = useState<File[]>([]);
  const [uploadedPhotosAfter, setUploadedPhotosAfter] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'before' | 'work' | 'after'>('before');
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ChecklistFormData>({
    defaultValues: {
      interventionId: interventionId || '',
      checksBefore: {
        visualInspection: false,
        temperatureCheck: false,
        noiseCheck: false,
        leakCheck: false,
        filterCheck: false
      },
      checksAfter: {
        visualInspection: false,
        temperatureCheck: false,
        noiseCheck: false,
        leakCheck: false,
        filterCheck: false
      },
      temperature: {
        before: 0,
        after: 0
      },
      duration: 1
    }
  });

  const handlePhotosBeforeUpload = (photos: File[]) => {
    setUploadedPhotosBefore(photos);
  };

  const handlePhotosAfterUpload = (photos: File[]) => {
    setUploadedPhotosAfter(photos);
  };

  const nextStep = () => {
    if (currentStep === 'before') setCurrentStep('work');
    else if (currentStep === 'work') setCurrentStep('after');
  };

  const prevStep = () => {
    if (currentStep === 'after') setCurrentStep('work');
    else if (currentStep === 'work') setCurrentStep('before');
  };

  const onSubmit = async (data: ChecklistFormData) => {
    setIsSubmitting(true);
    try {
      // Combine all data
      const formData = {
        ...data,
        photosBefore: uploadedPhotosBefore,
        photosAfter: uploadedPhotosAfter
      };
      
      // In a real app, this would send data to the database
      console.log('Submitting mobile checklist:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Checklist d\'intervention enregistrée avec succès');
      navigate('/dashboard/interventions');
    } catch (error) {
      console.error('Failed to submit checklist:', error);
      toast.error('Erreur lors de l\'enregistrement de la checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchChecksBefore = watch('checksBefore');
  const watchChecksAfter = watch('checksAfter');
  const allChecksBeforeDone = Object.values(watchChecksBefore).every(value => value === true);
  const allChecksAfterDone = Object.values(watchChecksAfter).every(value => value === true);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Checklist d'intervention</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            <div 
              className={`flex flex-col items-center ${currentStep === 'before' ? 'text-blue-600' : 'text-gray-400'}`}
              onClick={() => setCurrentStep('before')}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'before' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Avant</span>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep === 'before' ? 'bg-gray-200' : 'bg-blue-500'}`}></div>
            <div 
              className={`flex flex-col items-center ${currentStep === 'work' ? 'text-blue-600' : 'text-gray-400'}`}
              onClick={() => setCurrentStep('work')}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'work' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Tool className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Travaux</span>
            </div>
            <div className={`flex-1 h-0.5 ${currentStep === 'after' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div 
              className={`flex flex-col items-center ${currentStep === 'after' ? 'text-blue-600' : 'text-gray-400'}`}
              onClick={() => setCurrentStep('after')}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'after' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Après</span>
            </div>
          </div>

          {/* Equipment Selection - visible on all steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Équipement</label>
            <select
              {...register('equipmentId', { required: 'Ce champ est requis' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={currentStep !== 'before'}
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

          {/* Before Intervention Checks */}
          {currentStep === 'before' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vérifications avant intervention</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Controller
                      name="checksBefore.visualInspection"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="visualInspectionBefore"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="visualInspectionBefore" className="ml-2 block text-sm text-gray-900">
                      Inspection visuelle effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksBefore.temperatureCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="temperatureCheckBefore"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="temperatureCheckBefore" className="ml-2 block text-sm text-gray-900">
                      Vérification de la température effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksBefore.noiseCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="noiseCheckBefore"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="noiseCheckBefore" className="ml-2 block text-sm text-gray-900">
                      Vérification des bruits anormaux effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksBefore.leakCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="leakCheckBefore"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="leakCheckBefore" className="ml-2 block text-sm text-gray-900">
                      Vérification des fuites effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksBefore.filterCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="filterCheckBefore"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="filterCheckBefore" className="ml-2 block text-sm text-gray-900">
                      Vérification des filtres effectuée
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    {allChecksBeforeDone ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">
                      {allChecksBeforeDone 
                        ? 'Toutes les vérifications avant intervention sont complétées' 
                        : 'Certaines vérifications avant intervention ne sont pas complétées'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Temperature Before */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Thermometer className="inline-block h-4 w-4 mr-1" />
                  Température avant intervention (°C)
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

              {/* Photos Before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos avant intervention</label>
                <ReportPhotoUploader
                  onPhotosSelected={handlePhotosBeforeUpload}
                  maxPhotos={5}
                />
              </div>
            </>
          )}

          {/* Work Performed */}
          {currentStep === 'work' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Travaux réalisés</label>
                <textarea
                  {...register('workPerformed', { required: 'Ce champ est requis' })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Décrivez les travaux réalisés..."
                />
                {errors.workPerformed && (
                  <p className="mt-1 text-sm text-red-600">{errors.workPerformed.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pièces remplacées</label>
                <textarea
                  {...register('partsReplaced')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Liste des pièces remplacées..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  Durée de l'intervention (heures)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...register('duration', { 
                    required: 'Ce champ est requis',
                    min: { value: 0.5, message: 'La durée minimum est de 0.5 heure' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </>
          )}

          {/* After Intervention Checks */}
          {currentStep === 'after' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vérifications après intervention</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Controller
                      name="checksAfter.visualInspection"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="visualInspectionAfter"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="visualInspectionAfter" className="ml-2 block text-sm text-gray-900">
                      Inspection visuelle effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksAfter.temperatureCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="temperatureCheckAfter"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="temperatureCheckAfter" className="ml-2 block text-sm text-gray-900">
                      Vérification de la température effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksAfter.noiseCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="noiseCheckAfter"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="noiseCheckAfter" className="ml-2 block text-sm text-gray-900">
                      Vérification des bruits anormaux effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksAfter.leakCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="leakCheckAfter"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="leakCheckAfter" className="ml-2 block text-sm text-gray-900">
                      Vérification des fuites effectuée
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Controller
                      name="checksAfter.filterCheck"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="filterCheckAfter"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    />
                    <label htmlFor="filterCheckAfter" className="ml-2 block text-sm text-gray-900">
                      Vérification des filtres effectuée
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    {allChecksAfterDone ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium">
                      {allChecksAfterDone 
                        ? 'Toutes les vérifications après intervention sont complétées' 
                        : 'Certaines vérifications après intervention ne sont pas complétées'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Temperature After */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Thermometer className="inline-block h-4 w-4 mr-1" />
                  Température après intervention (°C)
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

              {/* Photos After */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos après intervention</label>
                <ReportPhotoUploader
                  onPhotosSelected={handlePhotosAfterUpload}
                  maxPhotos={5}
                />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep !== 'before' && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
            )}
            
            {currentStep !== 'after' ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Enregistrement...' : 'Finaliser l\'intervention'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileChecklistPage;