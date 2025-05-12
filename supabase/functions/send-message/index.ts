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
    const { recipientId, subject, content, interventionId } = await req.json();

    // Validate required fields
    if (!recipientId || !subject || !content) {
      throw new Error('Recipient, subject, and content are required');
    }

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: authUser.id,
        recipient_id: recipientId,
        subject,
        content,
        intervention_id: interventionId || null,
        read: false,
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Create a notification for the recipient
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        type: 'message',
        title: 'Nouveau message',
        message: `Vous avez reçu un message de ${authUser.user_metadata.name || authUser.email}`,
        priority: 'medium',
        metadata: {
          message_id: message.id,
          sender_id: authUser.id,
          subject,
        },
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification creation fails
    }

    // Send email notification (in a real app)
    // This would be implemented with a proper email service

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        data: message,
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
    console.error('Error sending message:', error);
    
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