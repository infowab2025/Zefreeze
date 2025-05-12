import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { installationService } from '../services/installationService';
import { InstallationRequest, TechnicianAvailability } from '../types/installation';

export const useInstallationRequests = () => {
  const queryClient = useQueryClient();

  const requests = useQuery({
    queryKey: ['installation-requests'],
    queryFn: installationService.getAllRequests,
  });

  const getRequest = (id: string) => useQuery({
    queryKey: ['installation-requests', id],
    queryFn: () => installationService.getRequestById(id),
    enabled: !!id,
  });

  const createRequest = useMutation({
    mutationFn: (data: Omit<InstallationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => 
      installationService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
    }
  });

  const assignTechnician = useMutation({
    mutationFn: ({ 
      requestId, 
      technicianId, 
      scheduledDate 
    }: { 
      requestId: string; 
      technicianId: string; 
      scheduledDate: string;
    }) => 
      installationService.assignTechnician(requestId, technicianId, scheduledDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['installations'] });
    }
  });

  const getTechnicianAvailability = (requestId: string) => useQuery({
    queryKey: ['technician-availability', requestId],
    queryFn: () => installationService.getTechnicianAvailability(requestId),
    enabled: !!requestId,
  });

  const updateRequestStatus = useMutation({
    mutationFn: ({ 
      requestId, 
      status 
    }: { 
      requestId: string; 
      status: InstallationRequest['status'];
    }) => 
      installationService.updateRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['installations'] });
    }
  });

  return {
    requests,
    getRequest,
    createRequest,
    assignTechnician,
    getTechnicianAvailability,
    updateRequestStatus,
  };
};