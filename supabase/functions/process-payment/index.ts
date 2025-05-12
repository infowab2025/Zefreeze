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
    const { invoiceId, paymentMethod } = await req.json();

    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    // Get the invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      throw new Error(`Invoice not found: ${invoiceError.message}`);
    }

    // In a real app, this would process the payment with Stripe
    // For now, we'll simulate it
    const payment = {
      id: `py_${Math.random().toString(36).substring(2, 15)}`,
      invoice_id: invoiceId,
      amount: invoice.amount,
      method: paymentMethod,
      status: 'completed',
      transaction_id: `tx_${Math.random().toString(36).substring(2, 15)}`,
      created_at: new Date().toISOString(),
    };

    // Update the invoice status
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      throw new Error(`Failed to update invoice: ${updateError.message}`);
    }

    // Create a payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    // Create a notification for the client
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: authUser.id,
        type: 'system',
        title: 'Paiement effectué',
        message: `Votre paiement de ${(invoice.amount / 100).toFixed(2)} € pour la facture ${invoice.number} a été traité avec succès.`,
        priority: 'low',
        metadata: {
          invoice_id: invoiceId,
          payment_id: paymentRecord.id,
        },
      }]);

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue even if notification creation fails
    }

    return new Response(
      JSON.stringify(paymentRecord),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    
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