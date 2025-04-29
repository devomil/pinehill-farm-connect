
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders, NotificationRequest } from "./notificationTypes.ts";
import { handleShiftReport } from "./shiftReportHandler.ts";
import { createNotifications } from "./notificationFactory.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    console.log(`Processing notification: ${request.actionType}`, { 
      actor: request.actor, 
      details: request.details,
      assignedTo: request.assignedTo || 'none'
    });
    
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
    // These go directly to the assigned individual
    if (request.actionType === "new_message" || 
        request.actionType === "shift_coverage_request" ||
        request.actionType === "shift_coverage_response") {
      
      // Validate the assignedTo property
      if (!request.assignedTo || !request.assignedTo.id) {
        console.error("Missing recipient information for message notification");
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Missing recipient information" 
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      
      // Create notifications directly using the assigned recipient
      const notifications = createNotifications(request, [request.assignedTo]);
      
      console.log(`Creating message notification for: ${request.assignedTo.name} (${request.assignedTo.email})`, notifications);
      
      // Insert notifications
      if (notifications.length > 0) {
        const { error: insertErr } = await supabase
          .from("notifications")
          .insert(notifications);
          
        if (insertErr) {
          console.error("Error inserting message notifications:", insertErr);
          throw insertErr;
        }
        
        console.log(`Successfully created ${notifications.length} message notifications`);
      }
      
      // Send email notification for messages
      try {
        // Only attempt to send email if there's a valid recipient email
        if (request.assignedTo.email && request.assignedTo.email.includes("@")) {
          console.log(`Sending email notification to ${request.assignedTo.name} (${request.assignedTo.email})`);
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
            body: {
              adminEmail: request.assignedTo.email,
              adminName: request.assignedTo.name,
              adminId: request.assignedTo.id,
              type: "message",
              priority: request.actionType === "shift_coverage_request" ? "high" : "normal",
              employeeName: request.actor.name,
              details: {
                senderEmail: request.actor.email,
                message: request.details.message || "New message",
                messageType: request.actionType,
                communicationId: request.details.communicationId,
                ...request.details // Include all other details like shift dates if present
              }
            }
          });
          
          if (emailError) {
            console.error("Email notification error:", emailError);
          } else {
            console.log("Email notification sent successfully:", emailData);
          }
        }
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
        // Continue, as we still want to return success for the DB notification
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully created notification for ${request.assignedTo.name}`
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
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
