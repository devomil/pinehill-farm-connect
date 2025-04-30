
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders, NotificationRequest } from "./notificationTypes.ts";
import { handleShiftReport } from "./shiftReportHandler.ts";
import { createNotifications } from "./notificationFactory.ts";

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
      
      // Create notifications for the primary recipient
      const notifications = createNotifications(request, [request.assignedTo]);
      
      console.log(`Creating message notification for: ${request.assignedTo.name} (${request.assignedTo.email})`, notifications);
      
      // Check if there's an admin that needs to be CC'd
      if (request.details.adminCc && 
          (request.actionType === "shift_coverage_request" || 
           request.actionType === "shift_coverage_response")) {
        
        console.log(`CC'ing admin: ${request.details.adminCc.name} (${request.details.adminCc.email})`);
        
        // Create a notification for the admin as well
        const adminNotifications = createNotifications(request, [request.details.adminCc], true);
        
        // Add admin notifications to the list
        notifications.push(...adminNotifications);
      }
      
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
      
      // Send email notifications
      try {
        // Send primary notification email
        if (request.assignedTo.email && request.assignedTo.email.includes("@")) {
          console.log(`Sending email notification to ${request.assignedTo.name} (${request.assignedTo.email})`);
          
          await sendEmailNotification(
            supabase,
            request.assignedTo,
            request.actionType,
            request.actor,
            request.details
          );
        }
        
        // Send CC notification to admin if applicable
        if (request.details.adminCc && 
            request.details.adminCc.email && 
            request.details.adminCc.email.includes("@")) {
          
          console.log(`Sending CC email notification to admin: ${request.details.adminCc.name} (${request.details.adminCc.email})`);
          
          await sendEmailNotification(
            supabase,
            request.details.adminCc,
            request.actionType + "_cc", // Add _cc suffix to indicate this is a CC notification
            request.actor,
            request.details
          );
        }
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
        // Continue, as we still want to return success for the DB notification
      }
      
      // Count how many people were notified
      const notifiedCount = 1 + (request.details.adminCc ? 1 : 0);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: notifiedCount === 1 
          ? `Successfully created notification for ${request.assignedTo.name}`
          : `Successfully created notifications for ${request.assignedTo.name} and CC'd admin ${request.details.adminCc.name}`
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

// Helper function to send email notification
async function sendEmailNotification(
  supabase,
  recipient,
  notificationType,
  sender,
  details
) {
  const { data: emailData, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
    body: {
      adminEmail: recipient.email,
      adminName: recipient.name,
      adminId: recipient.id,
      type: "message",
      priority: notificationType.includes("shift_coverage") ? "high" : "normal",
      employeeName: sender.name,
      details: {
        senderEmail: sender.email,
        message: details.message || "New message",
        messageType: notificationType,
        communicationId: details.communicationId,
        response: details.response, // For shift_coverage_response
        ...details // Include all other details like shift dates if present
      }
    }
  });
  
  if (emailError) {
    console.error("Email notification error:", emailError);
    throw emailError;
  }
  
  return emailData;
}
