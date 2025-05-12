import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  ArrowLeft, Save, Upload, Camera, 
  Thermometer, CheckCircle, XCircle, 
  Droplet, Snowflake, ShieldCheck,
  FileText, User, Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReports } from '../../hooks/useReports';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';
import SignatureCanvas from '../../components/reports/SignatureCanvas';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface HaccpFormData {
  interventionId?: string;
  equipmentId: string;
  interventionType: 'IRVE' | 'Électricité' | 'Photovoltaïque' | 'VMC';
  technicianName: string;
  chantierNumber: string;
  date: string;
  
  // Bloc 1 - Contextes & Risques
  tableauElectrique: 'Conforme' | 'NC';
  presenceHumidite: 'Oui' | 'Non';
  accesDegagé: 'Oui' | 'Non';
  zoneComplexe: 'Oui' | 'Non';
  materiauxInflammables: 'Oui' | 'Non';
  observationsBloc1?: string;
  
  // Bloc 2 - Mesures préventives
  portEPI: boolean;
  coupureAlimentation: boolean;
  verificationTension: boolean;
  signalisation: boolean;
  checkEtiquetage: boolean;
  
  // Bloc 3 - Points critiques
  testFonctionnement: 'Oui' | 'Non' | 'NC';
  verificationSerrages: 'Oui' | 'Non' | 'NC';
  etiquetageCircuits: 'Oui' | 'Non' | 'NC';
  nettoyageZone: 'Oui' | 'Non' | 'NC';
  photosJointes: 'Oui' | 'Non' | 'NC';
  remarquesBloc3?: string;
  
  // Bloc 4 - Conclusion
  conclusion: 'conforme' | 'anomalies';
  notes?: string;
  
  // Signatures
  technicianSignature: string | null;
  clientSignature: string | null;
}

const HaccpFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createReport } = useReports();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<HaccpFormData>({
    defaultValues: {
      interventionType: 'VMC',
      date: new Date().toISOString().split('T')[0],
      tableauElectrique: 'Conforme',
      presenceHumidite: 'Non',
      accesDegagé: 'Oui',
      zoneComplexe: 'Non',
      materiauxInflammables: 'Non',
      portEPI: true,
      coupureAlimentation: true,
      verificationTension: true,
      signalisation: true,
      checkEtiquetage: true,
      testFonctionnement: 'Oui',
      verificationSerrages: 'Oui',
      etiquetageCircuits: 'Oui',
      nettoyageZone: 'Oui',
      photosJointes: 'Non',
      conclusion: 'conforme'
    }
  });

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

        // If id is provided, pre-fill form
        if (id) {
          const { data: intervention } = await supabase
            .from('interventions')
            .select('*')
            .eq('id', id)
            .single();
          
          if (intervention) {
            setValue('interventionId', intervention.id);
            setValue('chantierNumber', intervention.id.substring(0, 8));
            
            if (intervention.equipment_id) {
              setValue('equipmentId', intervention.equipment_id);
            }
            
            if (user?.name) {
              setValue('technicianName', user.name);
            }
          }
        } else if (user?.name) {
          setValue('technicianName', user.name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchData();
  }, [id, setValue, user?.name]);

  const handlePhotoUpload = (photos: File[]) => {
    setUploadedPhotos(photos);
    setValue('photosJointes', photos.length > 0 ? 'Oui' : 'Non');
  };

  const onSubmit = async (data: HaccpFormData) => {
    if (!technicianSignature) {
      toast.error('La signature du technicien est requise');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare compliance data
      const compliance = {
        haccp: data.conclusion === 'conforme',
        refrigerant_leak: data.conclusion === 'conforme',
        frost: data.conclusion === 'conforme',
        safetySystem: data.portEPI && data.coupureAlimentation && data.verificationTension && data.signalisation,
        cleaningProcedures: data.nettoyageZone === 'Oui'
      };

      // Prepare notes
      const notes = `
MINI RAPPORT DE CONTRÔLE QUALITÉ / SÉCURITÉ (HACCP)
Type d'intervention : ${data.interventionType}
Technicien : ${data.technicianName}
Chantier n° : ${data.chantierNumber}
Date : ${new Date(data.date).toLocaleDateString('fr-FR')}

🔹 BLOC 1 — CONTEXTES & RISQUES IDENTIFIÉS AVANT INTERVENTION
- État du tableau électrique : ${data.tableauElectrique}
- Présence d'humidité / zone à risque : ${data.presenceHumidite}
- Accès dégagé et sécurisé : ${data.accesDegagé}
- Hauteur ou passage en zone complexe : ${data.zoneComplexe}
- Présence de matériaux inflammables à proximité : ${data.materiauxInflammables}
${data.observationsBloc1 ? `Observations : ${data.observationsBloc1}` : ''}

🔹 BLOC 2 — MESURES PRÉVENTIVES APPLIQUÉES PAR LE TECHNICIEN
- Port des EPI obligatoires : ${data.portEPI ? 'Oui' : 'Non'}
- Coupure de l'alimentation générale : ${data.coupureAlimentation ? 'Oui' : 'Non'}
- Vérification de l'absence de tension : ${data.verificationTension ? 'Oui' : 'Non'}
- Signalisation mise en place : ${data.signalisation ? 'Oui' : 'Non'}
- Check visuel de l'étiquetage : ${data.checkEtiquetage ? 'Oui' : 'Non'}

🔹 BLOC 3 — POINTS CRITIQUES / CONTRÔLES POST-INTERVENTION
- Test de bon fonctionnement : ${data.testFonctionnement}
- Vérification des serrages : ${data.verificationSerrages}
- Étiquetage clair des circuits : ${data.etiquetageCircuits}
- Nettoyage de la zone : ${data.nettoyageZone}
- Photos avant/après jointes : ${data.photosJointes}
${data.remarquesBloc3 ? `Remarques : ${data.remarquesBloc3}` : ''}

🔹 BLOC 4 — CONCLUSION & VALIDATION
${data.conclusion === 'conforme' ? '✅ Intervention sécurisée et conforme' : '⚠️ Anomalies relevées (à corriger ou à signaler)'}
${data.notes ? `Notes : ${data.notes}` : ''}
      `;

      // Prepare metadata
      const metadata = {
        formType: 'haccp',
        interventionType: data.interventionType,
        chantierNumber: data.chantierNumber,
        bloc1: {
          tableauElectrique: data.tableauElectrique,
          presenceHumidite: data.presenceHumidite,
          accesDegagé: data.accesDegagé,
          zoneComplexe: data.zoneComplexe,
          materiauxInflammables: data.materiauxInflammables,
          observations: data.observationsBloc1
        },
        bloc2: {
          portEPI: data.portEPI,
          coupureAlimentation: data.coupureAlimentation,
          verificationTension: data.verificationTension,
          signalisation: data.signalisation,
          checkEtiquetage: data.checkEtiquetage
        },
        bloc3: {
          testFonctionnement: data.testFonctionnement,
          verificationSerrages: data.verificationSerrages,
          etiquetageCircuits: data.etiquetageCircuits,
          nettoyageZone: data.nettoyageZone,
          photosJointes: data.photosJointes,
          remarques: data.remarquesBloc3
        },
        bloc4: {
          conclusion: data.conclusion,
          notes: data.notes
        }
      };

      // Create report
      const formData = {
        interventionId: data.interventionId,
        equipmentId: data.equipmentId,
        type: 'haccp',
        technicianId: user?.id,
        notes,
        recommendations: data.conclusion === 'conforme' ? 'Aucune recommandation particulière' : 'Corriger les anomalies signalées',
        photos: uploadedPhotos,
        compliance,
        technicianSignature,
        clientSignature,
        status: 'approved',
        metadata
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
          <h1 className="text-2xl font-bold text-gray-900">Formulaire HACCP</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* En-tête du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type d'intervention</label>
              <select
                {...register('interventionType', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="IRVE">IRVE</option>
                <option value="Électricité">Électricité</option>
                <option value="Photovoltaïque">Photovoltaïque</option>
                <option value="VMC">VMC</option>
              </select>
              {errors.interventionType && (
                <p className="mt-1 text-sm text-red-600">{errors.interventionType.message}</p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700">Technicien</label>
              <input
                type="text"
                {...register('technicianName', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.technicianName && (
                <p className="mt-1 text-sm text-red-600">{errors.technicianName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chantier n°</label>
              <input
                type="text"
                {...register('chantierNumber', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.chantierNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.chantierNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register('date', { required: 'Ce champ est requis' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Bloc 1 - Contextes & Risques */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔹 BLOC 1 — CONTEXTES & RISQUES IDENTIFIÉS AVANT INTERVENTION</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Point contrôlé
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      État du tableau électrique
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('tableauElectrique')}
                            value="Conforme"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Conforme</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('tableauElectrique')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" rowSpan={5}>
                      <textarea
                        {...register('observationsBloc1')}
                        rows={5}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Observations..."
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Présence d'humidité / zone à risque
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('presenceHumidite')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('presenceHumidite')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Accès dégagé et sécurisé
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('accesDegagé')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('accesDegagé')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Hauteur ou passage en zone complexe
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('zoneComplexe')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('zoneComplexe')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Présence de matériaux inflammables à proximité
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('materiauxInflammables')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('materiauxInflammables')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc 2 - Mesures préventives */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔹 BLOC 2 — MESURES PRÉVENTIVES APPLIQUÉES PAR LE TECHNICIEN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="portEPI"
                  {...register('portEPI')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="portEPI" className="ml-2 block text-sm text-gray-900">
                  Port des EPI obligatoires (gants, lunettes, chaussures)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="coupureAlimentation"
                  {...register('coupureAlimentation')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="coupureAlimentation" className="ml-2 block text-sm text-gray-900">
                  Coupure de l'alimentation générale avant intervention
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verificationTension"
                  {...register('verificationTension')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verificationTension" className="ml-2 block text-sm text-gray-900">
                  Vérification de l'absence de tension (VAT effectuée)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="signalisation"
                  {...register('signalisation')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="signalisation" className="ml-2 block text-sm text-gray-900">
                  Signalisation mise en place (rubalise, affiche danger)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checkEtiquetage"
                  {...register('checkEtiquetage')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="checkEtiquetage" className="ml-2 block text-sm text-gray-900">
                  Check visuel de l'étiquetage disjoncteurs / circuits
                </label>
              </div>
            </div>
          </div>

          {/* Bloc 3 - Points critiques */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔹 BLOC 3 — POINTS CRITIQUES / CONTRÔLES POST-INTERVENTION</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrôle final effectué
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Résultat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarques
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Test de bon fonctionnement
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('testFonctionnement')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('testFonctionnement')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('testFonctionnement')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" rowSpan={5}>
                      <textarea
                        {...register('remarquesBloc3')}
                        rows={5}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Remarques..."
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Vérification des serrages (coffret, dominos)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('verificationSerrages')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('verificationSerrages')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('verificationSerrages')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Étiquetage clair des circuits / bornes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('etiquetageCircuits')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('etiquetageCircuits')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('etiquetageCircuits')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Nettoyage de la zone après chantier
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('nettoyageZone')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('nettoyageZone')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('nettoyageZone')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Photos avant/après jointes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('photosJointes')}
                            value="Oui"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Oui</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('photosJointes')}
                            value="Non"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Non</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            {...register('photosJointes')}
                            value="NC"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">NC</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc 4 - Conclusion */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔹 BLOC 4 — CONCLUSION & VALIDATION</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('conclusion')}
                    value="conforme"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">✅ Intervention sécurisée et conforme</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('conclusion')}
                    value="anomalies"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">⚠️ Anomalies relevées (à corriger ou à signaler)</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes additionnelles</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
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
                  <User className="h-5 w-5 text-gray-400 mr-2" />
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
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">Signature du client (si présent)</label>
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
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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

export default HaccpFormPage;