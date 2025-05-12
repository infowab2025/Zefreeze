import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, PenTool as Tool, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/axios';
import TechnicianSchedule from '../../components/installation/TechnicianSchedule';
import TechnicianAvailabilityCalendar from '../../components/installation/TechnicianAvailabilityCalendar';
import { useInstallationRequests } from '../../hooks/useInstallationRequests';

const TechnicianAssignmentPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { getRequest, getTechnicianAvailability, assignTechnician } = useInstallationRequests();
  
  const { data: request, isLoading: isLoadingRequest } = getRequest(requestId || '');
  const { data: technicians, isLoading: isLoadingTechnicians } = getTechnicianAvailability(requestId || '');

  const handleAssignment = async () => {
    if (!selectedTechnician || !selectedDate || !requestId) {
      toast.error('Veuillez sélectionner un technicien et une date');
      return;
    }

    setIsAssigning(true);
    try {
      await assignTechnician.mutateAsync({
        requestId,
        technicianId: selectedTechnician,
        scheduledDate: selectedDate,
      });

      toast.success('Technicien assigné avec succès');
      navigate('/dashboard/installations');
    } catch (error) {
      console.error('Failed to assign technician:', error);
      toast.error('Erreur lors de l\'assignation du technicien');
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedTechnicianData = technicians?.find(t => t.id === selectedTechnician);

  if (isLoadingRequest || isLoadingTechnicians) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request || !technicians) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Demande non trouvée</h2>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Assignation du technicien</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Installation Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Détails de la demande</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Client</label>
                  <p className="mt-1 text-gray-900">{request.client?.name || 'Client'}</p>
                  <p className="text-sm text-gray-600">{request.client?.company || 'Entreprise'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type d'installation</label>
                  <p className="mt-1 text-gray-900">
                    {request.type === 'cold_storage' ? 'Froid commercial' :
                     request.type === 'vmc' ? 'VMC' : 'Autre'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse</label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{request.location.address}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date souhaitée</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {format(new Date(request.preferredDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{request.description}</p>
              </div>
            </div>
          </div>

          {/* Technician Calendar (when a technician is selected) */}
          {selectedTechnicianData && viewMode === 'calendar' && (
            <TechnicianAvailabilityCalendar
              technician={selectedTechnicianData}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          )}
        </div>

        {/* Technician Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Sélection du technicien</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                  >
                    <User className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {technicians.map((technician) => (
                  <div
                    key={technician.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTechnician === technician.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTechnician(technician.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{technician.name}</p>
                          <p className="text-sm text-gray-500">{technician.expertise.join(', ')}</p>
                        </div>
                      </div>
                      {selectedTechnician === technician.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    
                    {viewMode === 'list' && selectedTechnician === technician.id && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {technician.availability.slice(0, 3).map((slot) => (
                          <button
                            key={slot.date}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(slot.date);
                            }}
                            className={`p-2 text-xs rounded-md text-center ${
                              selectedDate === slot.date
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {format(new Date(slot.date), 'dd/MM')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAssignment}
                disabled={!selectedTechnician || !selectedDate || isAssigning}
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tool className="h-4 w-4 mr-2" />
                {isAssigning ? 'Attribution...' : 'Assigner le technicien'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAssignmentPage;