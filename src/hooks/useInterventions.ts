import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionService } from '../services/interventionService';
import { InterventionFormData } from '../types/intervention';

export const useInterventions = () => {
  const queryClient = useQueryClient();

  const interventions = useQuery({
    queryKey: ['interventions'],
    queryFn: interventionService.getAll,
  });

  const createIntervention = useMutation({
    mutationFn: (data: InterventionFormData) => interventionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });

  const updateIntervention = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InterventionFormData> }) => 
      interventionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });

  const deleteIntervention = useMutation({
    mutationFn: (id: string) => interventionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    }
  });

  return {
    interventions,
    createIntervention,
    updateIntervention,
    deleteIntervention,
  };
};