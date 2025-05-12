import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianService } from '../services/technicianService';
import { TechnicianFormData, TechnicianAvailabilityDay } from '../types/technician';
import { toast } from 'react-hot-toast';

export const useTechnicians = () => {
  const queryClient = useQueryClient();

  const technicians = useQuery({
    queryKey: ['technicians'],
    queryFn: technicianService.getAll,
  });

  const getTechnician = (id: string) => useQuery({
    queryKey: ['technicians', id],
    queryFn: () => technicianService.getById(id),
    enabled: !!id,
  });

  const createTechnician = useMutation({
    mutationFn: (data: TechnicianFormData) => technicianService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien créé avec succès');
    },
    onError: (error) => {
      console.error('Failed to create technician:', error);
      toast.error('Erreur lors de la création du technicien');
    },
  });

  const updateTechnician = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TechnicianFormData> }) => 
      technicianService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Failed to update technician:', error);
      toast.error('Erreur lors de la mise à jour du technicien');
    },
  });

  const deleteTechnician = useMutation({
    mutationFn: (id: string) => technicianService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      toast.success('Technicien désactivé avec succès');
    },
    onError: (error) => {
      console.error('Failed to delete technician:', error);
      toast.error('Erreur lors de la désactivation du technicien');
    },
  });

  const getTechnicianAvailability = (id: string) => useQuery({
    queryKey: ['technicians', id, 'availability'],
    queryFn: () => technicianService.getAvailability(id),
    enabled: !!id,
  });

  const saveTechnicianAvailability = useMutation({
    mutationFn: ({ technicianId, availability }: { technicianId: string; availability: TechnicianAvailabilityDay[] }) => 
      technicianService.saveAvailability(technicianId, availability),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['technicians', variables.technicianId, 'availability'] });
      toast.success('Disponibilités enregistrées avec succès');
    },
    onError: (error) => {
      console.error('Failed to save availability:', error);
      toast.error('Erreur lors de l\'enregistrement des disponibilités');
    },
  });

  const getTechnicianSchedule = (id: string, startDate: string, endDate: string) => useQuery({
    queryKey: ['technicians', id, 'schedule', startDate, endDate],
    queryFn: () => technicianService.getSchedule(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate,
  });

  const findAvailableTechnicians = (date: string, slot?: string, expertise?: string) => useQuery({
    queryKey: ['technicians', 'available', date, slot, expertise],
    queryFn: () => technicianService.findAvailableTechnicians(date, slot, expertise),
    enabled: !!date,
  });

  return {
    technicians,
    getTechnician,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    getTechnicianAvailability,
    saveTechnicianAvailability,
    getTechnicianSchedule,
    findAvailableTechnicians,
  };
};