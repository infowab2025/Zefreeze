import { api } from '../lib/axios';
import { Equipment, EquipmentFormData } from '../types/equipment';
import { supabase } from '../lib/supabase';

export const equipmentService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          company:company_id (id, name, address),
          location:company_id (id, name, address)
        `);
      
      if (error) throw error;
      
      return data as Equipment[];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          company:company_id (id, name, address),
          location:company_id (id, name, address)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Equipment;
    } catch (error) {
      console.error(`Error fetching equipment with id ${id}:`, error);
      throw error;
    }
  },

  create: async (data: EquipmentFormData) => {
    try {
      const { data: result, error } = await supabase
        .from('equipment')
        .insert({
          name: data.name,
          type: data.type,
          brand: data.brand,
          model: data.model,
          serial_number: data.serialNumber,
          installation_date: data.installationDate,
          company_id: data.locationId,
          specifications: data.specifications,
          status: 'operational',
          last_maintenance_date: new Date().toISOString(),
          next_maintenance_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return result as Equipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<EquipmentFormData>) => {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.type) updateData.type = data.type;
      if (data.brand) updateData.brand = data.brand;
      if (data.model) updateData.model = data.model;
      if (data.serialNumber) updateData.serial_number = data.serialNumber;
      if (data.installationDate) updateData.installation_date = data.installationDate;
      if (data.locationId) updateData.company_id = data.locationId;
      if (data.specifications) updateData.specifications = data.specifications;
      
      const { data: result, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return result as Equipment;
    } catch (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: Equipment['status']) => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Equipment;
    } catch (error) {
      console.error(`Error updating status for equipment with id ${id}:`, error);
      throw error;
    }
  },

  getMaintenanceSchedule: async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          company:company_id (id, name, address),
          location:company_id (id, name, address)
        `)
        .order('next_maintenance_date', { ascending: true })
        .limit(20);
      
      if (error) throw error;
      
      return data as Equipment[];
    } catch (error) {
      console.error('Error fetching maintenance schedule:', error);
      return [];
    }
  }
};