
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders, NotificationRequest } from "./notificationTypes.ts";
import { handleShiftReport } from "./shiftReportHandler.ts";
import { createNotifications } from "./notificationFactory.ts";
import { handleMessageNotification } from "./messageNotificationHandler.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    
    // Log the incoming request for debugging
    console.log(`Processing notification: ${request.actionType}`, { 
      actor: request.actor, 
      details: request.details,
      assignedTo: request.assignedTo || 'none'
    });
    
    // Handle missing actionType
    if (!request.actionType) {
      console.error("Missing actionType in request", request);
      return new Response(JSON.stringify({ 
        error: "Missing required field: actionType" 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    // Handle missing actor
    if (!request.actor || !request.actor.id) {
      console.error("Missing actor information in request", request);
      return new Response(JSON.stringify({ 
        error: "Missing required field: actor" 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    // Handle shift reports
    if (request.actionType === "shift_report") {
      const result = await handleShiftReport(supabase, request);
      
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      
      const notifications = createNotifications(request, result.notifiedManagers!);
      
      const { error: insertErr } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertErr) {
        console.error("Error inserting notifications:", insertErr);
        throw insertErr;
      }
      
      console.log(`Successfully created ${notifications.length} notifications`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully sent ${notifications.length} notifications to managers/admins`,
        notifiedManagers: result.notifiedManagers!.map(m => m.name)
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    } 
    
    // Handle message notifications (new_message, shift_coverage_request, shift_coverage_response)
    if (request.actionType === "new_message" || 
        request.actionType === "shift_coverage_request" ||
        request.actionType === "shift_coverage_response") {
      
      return await handleMessageNotification(supabase, request, corsHeaders);
    }
    
    // Handle other notification types
    let notifications = createNotifications(request, []);
    
    if (notifications.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No notifications to send" 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const { error: insertErr } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertErr) throw insertErr;
    
    console.log(`Successfully created ${notifications.length} notifications`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully sent ${notifications.length} notifications` 
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (e) {
    console.error("Error processing notification:", e);
    return new Response(JSON.stringify({ 
      error: e.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
