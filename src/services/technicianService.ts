import { supabase } from '../lib/supabase';
import { TechnicianDetails, TechnicianAvailabilityDay, TechnicianFormData } from '../types/technician';

export const technicianService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'technician')
      .order('name');
    
    if (error) throw error;
    
    // Format data for display
    return data.map(tech => ({
      ...tech,
      department: tech.metadata?.department || 'Non assigné',
      specialties: tech.metadata?.specialties || []
    })) as TechnicianDetails[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'technician')
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      department: data.metadata?.department || 'Non assigné',
      specialties: data.metadata?.specialties || []
    } as TechnicianDetails;
  },

  create: async (data: TechnicianFormData) => {
    // Create user with technician role
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password || 'tempPassword123',
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: 'technician'
      }
    });
    
    if (error) throw error;
    
    // Add to users table with additional metadata
    const { data: technicianData, error: techError } = await supabase
      .from('users')
      .insert({
        id: user.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'technician',
        active: data.active !== undefined ? data.active : true,
        metadata: {
          department: data.department || 'Technique',
          specialties: data.specialties || []
        }
      })
      .select()
      .single();
    
    if (techError) throw techError;
    
    return technicianData as TechnicianDetails;
  },

  update: async (id: string, data: Partial<TechnicianFormData>) => {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.active !== undefined) updateData.active = data.active;
    
    // Update metadata if department or specialties are provided
    if (data.department || data.specialties) {
      // First get current metadata
      const { data: currentUser } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', id)
        .single();
      
      const currentMetadata = currentUser?.metadata || {};
      
      updateData.metadata = {
        ...currentMetadata,
        ...(data.department && { department: data.department }),
        ...(data.specialties && { specialties: data.specialties })
      };
    }
    
    const { data: updatedData, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'technician')
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...updatedData,
      department: updatedData.metadata?.department || 'Non assigné',
      specialties: updatedData.metadata?.specialties || []
    } as TechnicianDetails;
  },

  delete: async (id: string) => {
    // In a real app, you might want to just deactivate instead of delete
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id)
      .eq('role', 'technician');
    
    if (error) throw error;
    
    return { success: true };
  },

  getAvailability: async (technicianId: string) => {
    const { data, error } = await supabase
      .from('technician_availability')
      .select('*')
      .eq('technician_id', technicianId);
    
    if (error) throw error;
    
    return data as TechnicianAvailabilityDay[];
  },

  saveAvailability: async (technicianId: string, availability: TechnicianAvailabilityDay[]) => {
    // First delete existing availability
    const { error: deleteError } = await supabase
      .from('technician_availability')
      .delete()
      .eq('technician_id', technicianId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new availability if there are any records
    if (availability.length > 0) {
      const availabilityWithTechId = availability.map(a => ({
        ...a,
        technician_id: technicianId
      }));
      
      const { error: insertError } = await supabase
        .from('technician_availability')
        .insert(availabilityWithTechId);
      
      if (insertError) throw insertError;
    }
    
    return { success: true };
  },

  getSchedule: async (technicianId: string, startDate: string, endDate: string) => {
    // Get availability
    const { data: availabilityData, error: availError } = await supabase
      .from('technician_availability')
      .select('*')
      .eq('technician_id', technicianId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (availError) throw availError;
    
    // Get interventions
    const { data: interventionsData, error: intError } = await supabase
      .from('interventions')
      .select(`
        id, 
        type, 
        status, 
        description, 
        scheduled_date,
        company:companies(name, address)
      `)
      .eq('technician_id', technicianId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate);
    
    if (intError) throw intError;
    
    // Format and combine data
    const schedule = availabilityData.map(avail => {
      const dayInterventions = interventionsData
        .filter(int => {
          const intDate = new Date(int.scheduled_date);
          return intDate.toISOString().split('T')[0] === avail.date;
        })
        .map(int => ({
          id: int.id,
          title: int.description.substring(0, 30) + (int.description.length > 30 ? '...' : ''),
          startTime: new Date(int.scheduled_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(new Date(int.scheduled_date).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          location: int.company?.address || 'Adresse non spécifiée',
          type: int.type as 'intervention' | 'installation' | 'maintenance',
          status: int.status as 'pending' | 'in_progress' | 'completed'
        }));
      
      return {
        id: avail.id,
        technicianId,
        date: avail.date,
        slots: avail.slots,
        interventions: dayInterventions
      };
    });
    
    return schedule;
  },

  findAvailableTechnicians: async (date: string, slot?: string, expertise?: string) => {
    const { data, error } = await supabase.rpc('find_available_technicians', {
      p_date: date,
      p_slot: slot,
      p_expertise: expertise
    });
    
    if (error) throw error;
    
    return data;
  }
};