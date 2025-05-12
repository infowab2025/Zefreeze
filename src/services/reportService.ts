import { api } from '../lib/axios';
import { Report, ReportFormData } from '../types/report';
import { supabase } from '../lib/supabase';

export const reportService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          intervention:intervention_id(
            id, type, category, company_id, technician_id,
            equipment:equipment_id(id, name, type)
          ),
          technician:technician_id(id, name),
          client:client_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return data.map(report => ({
        id: report.id,
        interventionId: report.intervention_id,
        type: report.type,
        technician: {
          id: report.technician?.id || report.intervention?.technician_id || '',
          name: report.technician?.name || 'Technicien',
          signature: report.technician_signature,
        },
        client: {
          id: report.client?.id || '',
          name: report.client?.name || 'Client',
          signature: report.client_signature,
        },
        temperature: {
          before: report.temperature_before,
          after: report.temperature_after,
        },
        photos: report.photos || [],
        notes: report.notes,
        recommendations: report.recommendations,
        compliance: report.compliance,
        createdAt: report.created_at,
        signedAt: report.signed_at,
        status: report.status,
        metadata: report.metadata,
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          intervention:intervention_id(
            id, type, category, company_id, technician_id,
            equipment:equipment_id(id, name, type)
          ),
          technician:technician_id(id, name),
          client:client_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return {
        id: data.id,
        interventionId: data.intervention_id,
        type: data.type,
        technician: {
          id: data.technician?.id || data.intervention?.technician_id || '',
          name: data.technician?.name || 'Technicien',
          signature: data.technician_signature,
        },
        client: {
          id: data.client?.id || '',
          name: data.client?.name || 'Client',
          signature: data.client_signature,
        },
        temperature: {
          before: data.temperature_before,
          after: data.temperature_after,
        },
        photos: data.photos || [],
        notes: data.notes,
        recommendations: data.recommendations,
        compliance: data.compliance,
        createdAt: data.created_at,
        signedAt: data.signed_at,
        status: data.status,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error(`Error fetching report with id ${id}:`, error);
      throw error;
    }
  },

  create: async (data: ReportFormData) => {
    try {
      // Handle file uploads first if there are any
      let photoUrls: string[] = [];
      
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          if (typeof photo === 'string') {
            photoUrls.push(photo);
            continue;
          }
          
          const fileName = `${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Create the report with photo URLs
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          intervention_id: data.interventionId,
          technician_id: data.technicianId,
          client_id: data.clientId,
          type: data.type,
          notes: data.notes,
          recommendations: data.recommendations,
          photos: photoUrls,
          compliance: data.compliance,
          temperature_before: data.temperature?.before,
          temperature_after: data.temperature?.after,
          status: data.status || 'draft',
          metadata: data.metadata || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: report.id,
        interventionId: report.intervention_id,
        type: report.type,
        notes: report.notes,
        recommendations: report.recommendations,
        photos: report.photos || [],
        compliance: report.compliance,
        temperature: {
          before: report.temperature_before,
          after: report.temperature_after,
        },
        createdAt: report.created_at,
        status: report.status,
      };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<ReportFormData>) => {
    try {
      // Handle file uploads first if there are any
      let photoUrls: string[] = [];
      
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          // Skip if it's a string (already uploaded)
          if (typeof photo === 'string') {
            photoUrls.push(photo);
            continue;
          }
          
          const fileName = `${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Prepare update data
      const updateData: any = {};
      
      if (data.type) updateData.type = data.type;
      if (data.notes) updateData.notes = data.notes;
      if (data.recommendations) updateData.recommendations = data.recommendations;
      if (photoUrls.length > 0) updateData.photos = photoUrls;
      if (data.compliance) updateData.compliance = data.compliance;
      if (data.temperature?.before) updateData.temperature_before = data.temperature.before;
      if (data.temperature?.after) updateData.temperature_after = data.temperature.after;
      if (data.status) updateData.status = data.status;
      if (data.metadata) updateData.metadata = data.metadata;
      if (data.technicianId) updateData.technician_id = data.technicianId;
      if (data.clientId) updateData.client_id = data.clientId;
      
      // Update the report
      const { data: report, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: report.id,
        interventionId: report.intervention_id,
        type: report.type,
        notes: report.notes,
        recommendations: report.recommendations,
        photos: report.photos || [],
        compliance: report.compliance,
        temperature: {
          before: report.temperature_before,
          after: report.temperature_after,
        },
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        status: report.status,
      };
    } catch (error) {
      console.error(`Error updating report with id ${id}:`, error);
      throw error;
    }
  },

  downloadPdf: async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
        body: { reportId: id }
      });
      
      if (error) throw error;
      
      // In a real app, this would return a blob
      // For now, we'll simulate it
      const content = `Report ID: ${id}\nGenerated on: ${new Date().toISOString()}\n\nThis is a simulated PDF report.`;
      return new Blob([content], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error downloading report PDF:', error);
      // Simulate a PDF for demo
      const content = `Report ID: ${id}\nGenerated on: ${new Date().toISOString()}\n\nThis is a simulated PDF report.`;
      return new Blob([content], { type: 'application/pdf' });
    }
  },
  
  addPhotos: async (reportId: string, photos: File[]) => {
    try {
      // Handle file uploads
      let photoUrls: string[] = [];
      
      for (const photo of photos) {
        const fileName = `${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photo);
        
        if (uploadError) throw uploadError;
        
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('report-photos')
          .getPublicUrl(fileName);
        
        photoUrls.push(publicUrlData.publicUrl);
      }
      
      // Get current photos
      const { data: currentReport, error: getError } = await supabase
        .from('reports')
        .select('photos')
        .eq('id', reportId)
        .single();
      
      if (getError) throw getError;
      
      // Combine current and new photos
      const allPhotos = [...(currentReport.photos || []), ...photoUrls];
      
      // Update the report with new photos
      const { data: report, error } = await supabase
        .from('reports')
        .update({ photos: allPhotos })
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: report.id,
        photos: report.photos || [],
      };
    } catch (error) {
      console.error(`Error adding photos to report ${reportId}:`, error);
      throw error;
    }
  },
  
  signReport: async (reportId: string, technicianSignature?: string, clientSignature?: string) => {
    try {
      const updateData: any = {
        status: 'approved',
        signed_at: new Date().toISOString(),
      };
      
      if (technicianSignature) {
        updateData.technician_signature = technicianSignature;
      }
      
      if (clientSignature) {
        updateData.client_signature = clientSignature;
      }
      
      const { data: report, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: report.id,
        status: report.status,
        signedAt: report.signed_at,
        technicianSignature: report.technician_signature,
        clientSignature: report.client_signature,
      };
    } catch (error) {
      console.error(`Error signing report ${reportId}:`, error);
      throw error;
    }
  },

  // New functions for HACCP and temperature logs
  getHaccpReports: async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          intervention:intervention_id(
            id, type, category, company_id, technician_id,
            equipment:equipment_id(id, name, type)
          ),
          technician:technician_id(id, name),
          client:client_id(id, name)
        `)
        .eq('type', 'haccp')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return data.map(report => ({
        id: report.id,
        interventionId: report.intervention_id,
        type: report.type,
        technician: {
          id: report.technician?.id || report.intervention?.technician_id || '',
          name: report.technician?.name || 'Technicien',
          signature: report.technician_signature,
        },
        client: {
          id: report.client?.id || '',
          name: report.client?.name || 'Client',
          signature: report.client_signature,
        },
        temperature: {
          before: report.temperature_before,
          after: report.temperature_after,
        },
        photos: report.photos || [],
        notes: report.notes,
        recommendations: report.recommendations,
        compliance: report.compliance,
        createdAt: report.created_at,
        signedAt: report.signed_at,
        status: report.status,
        metadata: report.metadata,
      }));
    } catch (error) {
      console.error('Error fetching HACCP reports:', error);
      return [];
    }
  },

  getTemperatureLogs: async () => {
    try {
      const { data, error } = await supabase
        .from('temperature_logs')
        .select(`
          *,
          equipment:equipment_id(id, name, type, specifications),
          technician:technician_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return data.map(log => {
        const specs = log.equipment?.specifications || {};
        return {
          id: log.id,
          equipmentId: log.equipment_id,
          equipmentName: log.equipment?.name || 'Équipement inconnu',
          equipmentType: log.equipment?.type || 'other',
          date: log.created_at.split('T')[0],
          time: log.created_at.split('T')[1].substring(0, 5),
          temperature: log.temperature,
          minThreshold: specs.temperature?.min || 0,
          maxThreshold: specs.temperature?.max || 0,
          isCompliant: log.is_compliant,
          notes: log.notes,
          technicianId: log.technician_id,
          technicianName: log.technician?.name || 'Technicien',
        };
      });
    } catch (error) {
      console.error('Error fetching temperature logs:', error);
      return [];
    }
  },

  addTemperatureLog: async (data: {
    equipmentId: string;
    temperature: number;
    notes?: string;
  }) => {
    try {
      // Get equipment specifications to check compliance
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('specifications')
        .eq('id', data.equipmentId)
        .single();
      
      if (equipmentError) throw equipmentError;
      
      const specs = equipment.specifications || {};
      const minTemp = specs.temperature?.min || 0;
      const maxTemp = specs.temperature?.max || 0;
      const isCompliant = data.temperature >= minTemp && data.temperature <= maxTemp;
      
      // Insert temperature log
      const { data: log, error } = await supabase
        .from('temperature_logs')
        .insert({
          equipment_id: data.equipmentId,
          temperature: data.temperature,
          is_compliant: isCompliant,
          notes: data.notes,
          technician_id: (await supabase.auth.getSession()).data.session?.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification if not compliant
      if (!isCompliant) {
        await supabase
          .from('notifications')
          .insert({
            user_id: (await supabase.auth.getSession()).data.session?.user.id,
            type: 'alert',
            title: 'Alerte température',
            message: `Température hors limites: ${data.temperature}°C (Seuils: ${minTemp}-${maxTemp}°C)`,
            priority: 'high',
            metadata: {
              equipment_id: data.equipmentId,
              temperature: data.temperature,
              min_threshold: minTemp,
              max_threshold: maxTemp,
            },
          });
      }
      
      return log;
    } catch (error) {
      console.error('Error adding temperature log:', error);
      throw error;
    }
  },

  createFeasibilityReport: async (data: any) => {
    try {
      // Handle file uploads first if there are any
      let photoUrls: string[] = [];
      
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          if (typeof photo === 'string') {
            photoUrls.push(photo);
            continue;
          }
          
          const fileName = `${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Create the feasibility report
      const { data: report, error } = await supabase
        .from('feasibility_reports')
        .insert({
          client_id: data.clientId,
          location: data.location,
          project_type: data.projectType,
          project_description: data.projectDescription,
          technical_conditions: data.technicalConditions,
          recommendations: data.recommendations,
          estimated_cost: data.estimatedCost,
          estimated_duration: data.estimatedDuration,
          feasibility_score: data.feasibilityScore,
          notes: data.notes,
          photos: photoUrls,
          technician_id: (await supabase.auth.getSession()).data.session?.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return report;
    } catch (error) {
      console.error('Error creating feasibility report:', error);
      throw error;
    }
  },

  createInstallationReport: async (data: any) => {
    try {
      // Handle file uploads first if there are any
      let photoUrls: string[] = [];
      
      if (data.photos && data.photos.length > 0) {
        for (const photo of data.photos) {
          if (typeof photo === 'string') {
            photoUrls.push(photo);
            continue;
          }
          
          const fileName = `${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Create the installation report
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          intervention_id: data.interventionId,
          equipment_id: data.equipmentId,
          type: 'intervention',
          notes: data.notes,
          recommendations: data.recommendations,
          photos: photoUrls,
          temperature_after: data.temperature?.after,
          technician_signature: data.technicianSignature,
          client_signature: data.clientSignature,
          status: 'approved',
          signed_at: new Date().toISOString(),
          metadata: {
            installation_type: data.installationType,
            work_performed: data.workPerformed,
            parts_replaced: data.partsReplaced,
            client_feedback: data.clientFeedback
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return report;
    } catch (error) {
      console.error('Error creating installation report:', error);
      throw error;
    }
  },

  submitMobileChecklist: async (data: any) => {
    try {
      // Handle file uploads first if there are any
      let photoBeforeUrls: string[] = [];
      let photoAfterUrls: string[] = [];
      
      if (data.photosBefore && data.photosBefore.length > 0) {
        for (const photo of data.photosBefore) {
          const fileName = `before-${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoBeforeUrls.push(publicUrlData.publicUrl);
        }
      }
      
      if (data.photosAfter && data.photosAfter.length > 0) {
        for (const photo of data.photosAfter) {
          const fileName = `after-${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
          
          if (uploadError) throw uploadError;
          
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          
          photoAfterUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Create the checklist report
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          intervention_id: data.interventionId,
          equipment_id: data.equipmentId,
          type: 'intervention',
          notes: data.notes || 'Intervention réalisée via checklist mobile',
          temperature_before: data.temperature?.before,
          temperature_after: data.temperature?.after,
          photos: [...photoBeforeUrls, ...photoAfterUrls],
          status: 'approved',
          metadata: {
            checks_before: data.checksBefore,
            checks_after: data.checksAfter,
            work_performed: data.workPerformed,
            parts_replaced: data.partsReplaced,
            duration: data.duration,
            photos_before: photoBeforeUrls,
            photos_after: photoAfterUrls
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update intervention status to completed
      const { error: interventionError } = await supabase
        .from('interventions')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          temperature_before: data.temperature?.before,
          temperature_after: data.temperature?.after
        })
        .eq('id', data.interventionId);
      
      if (interventionError) throw interventionError;
      
      return report;
    } catch (error) {
      console.error('Error submitting mobile checklist:', error);
      throw error;
    }
  }
};