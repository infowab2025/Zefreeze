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

    const { type, companyId, description, location, preferredDate } = await req.json();

    // Create installation request
    const { data: request, error: requestError } = await supabaseClient
      .from("installation_requests")
      .insert({
        type,
        company_id: companyId,
        description,
        location,
        preferred_date: preferredDate,
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Get available technicians
    const { data: technicians, error: techniciansError } = await supabaseClient
      .rpc("get_available_technicians", {
        request_date: preferredDate,
        installation_type: type,
      });

    if (techniciansError) throw techniciansError;

    // Notify technicians
    const notifications = technicians.map((technician) => ({
      user_id: technician.id,
      type: "installation_request",
      title: "Nouvelle demande d'installation",
      message: `Une nouvelle demande d'installation ${type} est disponible`,
      priority: "medium",
      metadata: {
        request_id: request.id,
        type,
        preferred_date: preferredDate,
      },
    }));

    const { error: notificationError } = await supabaseClient
      .from("notifications")
      .insert(notifications);

    if (notificationError) throw notificationError;

    return new Response(
      JSON.stringify({ success: true, data: request }),
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