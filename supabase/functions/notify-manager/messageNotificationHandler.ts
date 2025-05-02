
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { NotificationRequest } from "./notificationTypes.ts";
import { createNotifications } from "./notificationFactory.ts";

export async function handleMessageNotification(
  supabase: SupabaseClient,
  request: NotificationRequest,
  corsHeaders: Record<string, string>
) {
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

// Helper function to send email notification
async function sendEmailNotification(
  supabase: SupabaseClient,
  recipient: {
    id: string;
    name: string;
    email: string;
  },
  notificationType: string,
  sender: {
    id: string;
    name: string;
    email: string;
  },
  details: any
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
