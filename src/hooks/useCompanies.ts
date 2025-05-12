import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '../services/companyService';
import { Company } from '../types/company';
import { supabase } from '../lib/supabase';

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const companies = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching companies:', error);
        return [];
      }
    }
  });

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const getCompany = (id: string) => useQuery({
    queryKey: ['companies', id],
    queryFn: () => companyService.getById(id),
    enabled: !!id,
  });

  const createCompany = useMutation({
    mutationFn: (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => 
      companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });

  const updateCompany = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) => 
      companyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });

  const deleteCompany = useMutation({
    mutationFn: (id: string) => companyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });

  const getCompanyStats = (id: string) => useQuery({
    queryKey: ['companies', id, 'stats'],
    queryFn: () => companyService.getStats(id),
    enabled: !!id,
  });

  const getCompanyEquipment = (id: string) => useQuery({
    queryKey: ['companies', id, 'equipment'],
    queryFn: () => companyService.getEquipment(id),
    enabled: !!id,
  });

  const getCompanyUsers = (id: string) => useQuery({
    queryKey: ['companies', id, 'users'],
    queryFn: () => companyService.getUsers(id),
    enabled: !!id,
  });

  const getCompanyInterventions = (id: string) => useQuery({
    queryKey: ['companies', id, 'interventions'],
    queryFn: () => companyService.getInterventions(id),
    enabled: !!id,
  });

  return {
    companies,
    fetchCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyStats,
    getCompanyEquipment,
    getCompanyUsers,
    getCompanyInterventions,
  };
};