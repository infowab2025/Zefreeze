import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { requestId, technicianId, scheduledDate } = await req.json();

    // Assign technician to request
    const { data: assignment, error: assignmentError } = await supabaseClient
      .rpc("assign_technician_to_request", {
        p_request_id: requestId,
        p_technician_id: technicianId,
        p_scheduled_date: scheduledDate,
      });

    if (assignmentError) throw assignmentError;

    return new Response(
      JSON.stringify({ success: true, data: assignment }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});