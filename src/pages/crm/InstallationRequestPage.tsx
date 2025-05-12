import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useInstallationRequests } from '../../hooks/useInstallationRequests';
import InstallationRequestForm from '../../components/installation/InstallationRequestForm';

const InstallationRequestPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRequest } = useInstallationRequests();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createRequest.mutateAsync({
        ...data,
        companyId: '1', // In a real app, this would come from the current user's company
      });
      
      toast.success('Demande d\'installation envoyée avec succès');
      navigate('/dashboard/installations');
    } catch (error) {
      console.error('Failed to submit installation request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/installations')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande d'installation</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Formulaire de demande</h2>
        </div>
        <div className="p-6">
          <InstallationRequestForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default InstallationRequestPage;