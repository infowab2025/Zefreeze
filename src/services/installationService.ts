import { api } from '../lib/axios';
import { InstallationRequest, TechnicianAvailability } from '../types/installation';
import { supabase } from '../lib/supabase';

export const installationService = {
  getAllRequests: async () => {
    // In a real app, this would be an API call
    const { data, error } = await supabase
      .from('installation_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as InstallationRequest[];
  },

  getRequestById: async (id: string) => {
    // In a real app, this would be an API call
    const { data, error } = await supabase
      .from('installation_requests')
      .select(`
        *,
        client:company_id (
          name,
          address
        ),
        technician:technician_id (
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as InstallationRequest;
  },

  createRequest: async (data: Omit<InstallationRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    // In a real app, this would be an API call
    const { data: result, error } = await supabase
      .from('installation_requests')
      .insert({
        company_id: data.companyId,
        type: data.type,
        description: data.description,
        location: data.location,
        preferred_date: data.preferredDate,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return result as InstallationRequest;
  },

  assignTechnician: async (requestId: string, technicianId: string, scheduledDate: string) => {
    // In a real app, this would be an API call to the edge function
    const { data, error } = await supabase.rpc('assign_technician_to_request', {
      p_request_id: requestId,
      p_technician_id: technicianId,
      p_scheduled_date: scheduledDate
    });
    
    if (error) throw error;
    return data as InstallationRequest;
  },

  getTechnicianAvailability: async (requestId: string) => {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    const { data: request, error: requestError } = await supabase
      .from('installation_requests')
      .select('preferred_date, type')
      .eq('id', requestId)
      .single();
    
    if (requestError) throw requestError;
    
    const { data: technicians, error: techniciansError } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('role', 'technician')
      .eq('active', true);
    
    if (techniciansError) throw techniciansError;
    
    // Mock availability data
    return technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      availability: [
        {
          date: request.preferred_date,
          slots: ['morning', 'afternoon']
        },
        {
          date: new Date(new Date(request.preferred_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          slots: ['morning']
        },
        {
          date: new Date(new Date(request.preferred_date).getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
          slots: ['afternoon']
        }
      ],
      expertise: ['cold_storage', 'vmc'],
      currentLoad: Math.floor(Math.random() * 5)
    })) as TechnicianAvailability[];
  },

  updateRequestStatus: async (requestId: string, status: InstallationRequest['status']) => {
    // In a real app, this would be an API call
    const { data, error } = await supabase
      .from('installation_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) throw error;
    return data as InstallationRequest;
  },

  getAllInstallations: async () => {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    return [
      {
        id: 'INST-001',
        type: 'cold_storage',
        client: {
          name: 'Restaurant Le Provençal',
          address: '123 Rue de Paris, 75001 Paris'
        },
        installationDate: '2025-05-15',
        status: 'planned',
        technician: {
          name: 'Martin Dupuis'
        }
      },
      {
        id: 'INST-002',
        type: 'vmc',
        client: {
          name: 'Hôtel Le Méridien',
          address: '45 Boulevard Haussmann, 75009 Paris'
        },
        installationDate: '2025-05-20',
        status: 'in_progress',
        technician: {
          name: 'Sophie Leclerc'
        }
      },
      {
        id: 'INST-003',
        type: 'cold_storage',
        client: {
          name: 'Boucherie Moderne',
          address: '78 Rue du Commerce, 75015 Paris'
        },
        installationDate: '2025-04-30',
        status: 'completed',
        technician: {
          name: 'Thomas Petit'
        }
      }
    ];
  },

  getInstallationById: async (id: string) => {
    // In a real app, this would be an API call
    // For now, we'll return mock data
    return {
      id,
      type: 'cold_storage',
      client: {
        name: 'Restaurant Le Provençal',
        address: '123 Rue de Paris, 75001 Paris'
      },
      installationDate: '2025-05-15',
      status: 'planned',
      technician: {
        name: 'Martin Dupuis'
      },
      details: {
        equipment: {
          type: 'Chambre froide positive',
          specifications: 'Dimensions: 3m x 2m x 2.5m, Température: 2-8°C'
        },
        notes: 'Installation prévue dans l\'arrière-cuisine',
        documents: [
          { name: 'Devis signé', url: '#' },
          { name: 'Plan d\'installation', url: '#' }
        ]
      }
    };
  }
};