import { api } from '../lib/axios';
import { Company } from '../types/company';
import { supabase } from '../lib/supabase';

export const companyService = {
  getAll: async () => {
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
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching company with id ${id}:`, error);
      throw error;
    }
  },

  create: async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from('companies')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Company>) => {
    try {
      const { data: result, error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error updating company with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting company with id ${id}:`, error);
      throw error;
    }
  },

  getStats: async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('get_company_stats', { company_id: id });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching stats for company with id ${id}:`, error);
      return {
        equipmentCount: 0,
        userCount: 0,
        interventionCount: 0
      };
    }
  },

  getEquipment: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('company_id', id);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching equipment for company with id ${id}:`, error);
      return [];
    }
  },

  getUsers: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', id);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching users for company with id ${id}:`, error);
      return [];
    }
  },

  getInterventions: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('company_id', id);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching interventions for company with id ${id}:`, error);
      return [];
    }
  }
};