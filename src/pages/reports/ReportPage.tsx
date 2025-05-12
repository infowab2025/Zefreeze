import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FileText, Download, ThermometerSnowflake, 
  Camera, CheckCircle, XCircle, AlertTriangle,
  Edit, ArrowLeft, Save, Trash2, PenTool as Tool,
  ClipboardCheck
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import SignatureCanvas from '../../components/reports/SignatureCanvas';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const ReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReport, downloadReportPdf, updateReport, addPhotos, signReport } = useReports();
  const { data: report, isLoading } = getReport(id || '');
  
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (id) {
      downloadReportPdf.mutate(id);
    }
  };
  
  const handleSignReport = async () => {
    if (!id || !technicianSignature || !clientSignature) {
      toast.error('Les deux signatures sont requises');
      return;
    }
    
    try {
      await signReport.mutateAsync({
        reportId: id,
        technicianSignature,
        clientSignature
      });
      
      toast.success('Rapport signé avec succès');
      setIsSigningMode(false);
    } catch (error) {
      console.error('Failed to sign report:', error);
      toast.error('Erreur lors de la signature du rapport');
    }
  };
  
  const handleAddPhotos = async () => {
    if (!id || newPhotos.length === 0) {
      toast.error('Veuillez sélectionner au moins une photo');
      return;
    }
    
    try {
      await addPhotos.mutateAsync({
        reportId: id,
        photos: newPhotos
      });
      
      toast.success('Photos ajoutées avec succès');
      setIsAddingPhotos(false);
      setNewPhotos([]);
    } catch (error) {
      console.error('Failed to add photos:', error);
      toast.error('Erreur lors de l\'ajout des photos');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
        await supabase
          .from('reports')
          .delete()
          .eq('id', id);
        
        toast.success('Rapport supprimé avec succès');
        navigate('/dashboard/reports');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Erreur lors de la suppression du rapport');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Rapport non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapport {report.type === 'intervention' ? 'd\'intervention' : 
                      report.type === 'haccp' ? 'HACCP' : 'de maintenance'}
            </h1>
            <p className="text-gray-600">
              {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isSigningMode && !isAddingPhotos && (
            <>
              <Link 
                to="/dashboard/reports/haccp"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Formulaire HACCP
              </Link>
              <button 
                onClick={() => setIsAddingPhotos(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Ajouter des photos
              </button>
              <button 
                onClick={() => setIsSigningMode(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Signer le rapport
              </button>
              <Link 
                to={`/dashboard/reports/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
              <button 
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </button>
            </>
          )}
          
          {isSigningMode && (
            <>
              <button 
                onClick={() => setIsSigningMode(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Annuler
              </button>
              <button 
                onClick={handleSignReport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les signatures
              </button>
            </>
          )}
          
          {isAddingPhotos && (
            <>
              <button 
                onClick={() => setIsAddingPhotos(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Annuler
              </button>
              <button 
                onClick={handleAddPhotos}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les photos
              </button>
            </>
          )}
        </div>
      </div>

      {isSigningMode ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Signature du rapport</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignatureCanvas 
              label="Signature du technicien"
              onSignatureChange={setTechnicianSignature}
            />
            <SignatureCanvas 
              label="Signature du client"
              onSignatureChange={setClientSignature}
            />
          </div>
        </div>
      ) : isAddingPhotos ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Ajouter des photos</h2>
          </div>
          <div className="p-6">
            <ReportPhotoUploader
              existingPhotos={report.photos}
              onPhotosSelected={setNewPhotos}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Client</h3>
                <p className="mt-1 text-sm text-gray-900">{report.client.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Technicien</h3>
                <p className="mt-1 text-sm text-gray-900">{report.technician.name}</p>
              </div>
            </div>
          </div>

          {/* Temperature Readings */}
          {report.temperature && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Relevés de température</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ThermometerSnowflake className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Avant intervention</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {report.temperature.before}°C
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ThermometerSnowflake className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Après intervention</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {report.temperature.after}°C
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* HACCP Compliance */}
          {report.compliance && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Conformité HACCP</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  {report.compliance.haccp ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-900">Normes HACCP</span>
                </div>
                <div className="flex items-center space-x-2">
                  {report.compliance.refrigerantLeak ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-900">Absence de fuite</span>
                </div>
                <div className="flex items-center space-x-2">
                  {report.compliance.frost ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-900">Absence de givre</span>
                </div>
                {report.compliance.safetySystem !== undefined && (
                  <div className="flex items-center space-x-2">
                    {report.compliance.safetySystem ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-900">Systèmes de sécurité</span>
                  </div>
                )}
                {report.compliance.cleaningProcedures !== undefined && (
                  <div className="flex items-center space-x-2">
                    {report.compliance.cleaningProcedures ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-900">Procédures de nettoyage</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {report.photos && report.photos.length > 0 && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Camera className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes and Recommendations */}
          <div className="px-6 py-4">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes techniques</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.notes}</p>
            </div>
            {report.recommendations && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recommandations</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.recommendations}</p>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Signature technicien</h3>
                {report.technician.signature ? (
                  <img
                    src={report.technician.signature}
                    alt="Signature technicien"
                    className="h-16"
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">En attente de signature</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Signature client</h3>
                {report.client.signature ? (
                  <img
                    src={report.client.signature}
                    alt="Signature client"
                    className="h-16"
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">En attente de signature</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;