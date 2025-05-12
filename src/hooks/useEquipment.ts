import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../services/equipmentService';
import { EquipmentFormData } from '../types/equipment';

export const useEquipment = () => {
  const queryClient = useQueryClient();

  const equipment = useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentService.getAll,
  });

  const getEquipment = (id: string) => useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getById(id),
    enabled: !!id,
  });

  const maintenanceSchedule = useQuery({
    queryKey: ['equipment', 'maintenance-schedule'],
    queryFn: equipmentService.getMaintenanceSchedule,
  });

  const createEquipment = useMutation({
    mutationFn: (data: EquipmentFormData) => equipmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const updateEquipment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentFormData> }) => 
      equipmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const deleteEquipment = useMutation({
    mutationFn: (id: string) => equipmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const updateEquipmentStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Equipment['status'] }) => 
      equipmentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  return {
    equipment,
    getEquipment,
    maintenanceSchedule,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    updateEquipmentStatus,
  };
};