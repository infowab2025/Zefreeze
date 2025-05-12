import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Deployment ID is required');
    }

    // In a real app, this would check the actual deployment status
    // For now, we'll simulate a successful deployment
    const deploymentStatus = {
      id,
      status: 'success',
      deploy_url: `https://example-${id}.netlify.app`,
      claim_url: `https://app.netlify.com/claim/${id}`,
      claimed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(deploymentStatus),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking deployment status:', error);
    
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