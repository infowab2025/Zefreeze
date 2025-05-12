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
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    // Get the invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:company_id(name, address, email, phone),
        items:invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      throw new Error(`Invoice not found: ${invoiceError.message}`);
    }

    // In a real app, this would generate a PDF using a library like PDFKit
    // For now, we'll simulate it by returning a simple text representation
    const invoiceText = `
      FACTURE ${invoice.number}
      
      Date d'émission: ${new Date(invoice.created_at).toLocaleDateString('fr-FR')}
      Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}
      
      Client:
      ${invoice.customer.name}
      ${invoice.customer.address}
      ${invoice.customer.email}
      ${invoice.customer.phone || ''}
      
      Éléments:
      ${invoice.items.map(item => 
        `${item.description} - ${item.quantity} x ${(item.unit_price / 100).toFixed(2)} € = ${(item.total / 100).toFixed(2)} €`
      ).join('\n')}
      
      Total HT: ${((invoice.amount * 0.8) / 100).toFixed(2)} €
      TVA (20%): ${((invoice.amount * 0.2) / 100).toFixed(2)} €
      Total TTC: ${(invoice.amount / 100).toFixed(2)} €
      
      Statut: ${invoice.status}
      ${invoice.paid_at ? `Payée le: ${new Date(invoice.paid_at).toLocaleDateString('fr-FR')}` : ''}
    `;

    // Update the invoice to include the PDF URL
    const pdfUrl = `https://example.com/invoices/${invoiceId}.pdf`;
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Failed to update invoice with PDF URL:', updateError);
      // Continue even if update fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_url: pdfUrl,
        content: invoiceText
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
    console.error('Error generating invoice PDF:', error);
    
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