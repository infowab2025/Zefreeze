import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !authUser) {
      throw new Error('Invalid or expired token');
    }

    // Parse the request body
    const { reportId } = await req.json();

    if (!reportId) {
      throw new Error('Report ID is required');
    }

    // Get the report details
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        intervention:intervention_id(
          id, type, category, description, 
          equipment:equipment_id(id, name, type, specifications),
          company:company_id(id, name, address)
        ),
        technician:technician_id(name, email),
        client:client_id(name, address)
      `)
      .eq('id', reportId)
      .single();

    if (reportError) {
      throw new Error(`Report not found: ${reportError.message}`);
    }

    // In a real app, this would generate a PDF using a library like PDFKit
    // For now, we'll simulate it by returning a simple text representation
    const reportText = `
      RAPPORT ${report.type.toUpperCase()}
      
      Date: ${new Date(report.created_at).toLocaleDateString('fr-FR')}
      ${report.signed_at ? `Date de signature: ${new Date(report.signed_at).toLocaleDateString('fr-FR')}` : ''}
      
      Équipement: ${report.intervention?.equipment?.name || 'Non spécifié'}
      Type: ${getEquipmentType(report.intervention?.equipment?.type)}
      
      Client: ${report.client?.name || report.intervention?.company?.name || 'Non spécifié'}
      Adresse: ${report.client?.address || report.intervention?.company?.address || 'Non spécifiée'}
      
      Technicien: ${report.technician?.name || 'Non spécifié'}
      
      ${report.temperature_before || report.temperature_after ? `
      Température:
      ${report.temperature_before ? `Avant: ${report.temperature_before}°C` : ''}
      ${report.temperature_after ? `Après: ${report.temperature_after}°C` : ''}
      ` : ''}
      
      ${report.compliance ? `
      Conformité HACCP:
      - Normes HACCP: ${report.compliance.haccp ? 'Conforme' : 'Non conforme'}
      - Absence de fuite: ${report.compliance.refrigerant_leak ? 'Conforme' : 'Non conforme'}
      - Absence de givre: ${report.compliance.frost ? 'Conforme' : 'Non conforme'}
      ${report.compliance.safety_system !== undefined ? `- Systèmes de sécurité: ${report.compliance.safety_system ? 'Conforme' : 'Non conforme'}` : ''}
      ${report.compliance.cleaning_procedures !== undefined ? `- Procédures de nettoyage: ${report.compliance.cleaning_procedures ? 'Conforme' : 'Non conforme'}` : ''}
      ` : ''}
      
      Notes:
      ${report.notes}
      
      ${report.recommendations ? `
      Recommandations:
      ${report.recommendations}
      ` : ''}
      
      ${report.technician_signature ? 'Signature du technicien: [Signé électroniquement]' : ''}
      ${report.client_signature ? 'Signature du client: [Signé électroniquement]' : ''}
    `;

    // Update the report to include the PDF URL
    const pdfUrl = `https://example.com/reports/${reportId}.pdf`;
    const { error: updateError } = await supabase
      .from('reports')
      .update({ pdf_url: pdfUrl })
      .eq('id', reportId);

    if (updateError) {
      console.error('Failed to update report with PDF URL:', updateError);
      // Continue even if update fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: pdfUrl,
        content: reportText
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating report PDF:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});

function getEquipmentType(type: string | undefined): string {
  switch (type) {
    case 'cold_storage':
      return 'Froid commercial';
    case 'vmc':
      return 'VMC';
    default:
      return 'Autre';
  }
}