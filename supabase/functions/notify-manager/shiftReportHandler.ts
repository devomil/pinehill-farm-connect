
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { NotificationRequest, ManagerProfile } from "./notificationTypes.ts";

export async function handleShiftReport(
  supabase: SupabaseClient,
  request: NotificationRequest
) {
  const { actor, details, assignedTo } = request;
  console.log("Processing shift report notification", { actor, assignedTo });

  // Case 1: If we have a specific assignee, use their email directly
  if (assignedTo) {
    console.log(`Using direct assignment to: ${assignedTo.name} (${assignedTo.email})`);
    
    // Verify the email is valid
    if (!assignedTo.email || !assignedTo.email.includes('@')) {
      console.error(`Invalid assignedTo email: ${assignedTo.email}`);
      return { 
        success: false, 
        error: `Invalid email format for assigned user: ${assignedTo.email}` 
      };
    }
    
    // Send to the specific assignee
    const result = await sendAdminNotification(
      supabase,
      {
        id: assignedTo.id,
        name: assignedTo.name,
        email: assignedTo.email
      },
      actor,
      details
    );
    
    if (!result.success) {
      return result;
    }
    
    return { 
      success: true,
      notifiedManagers: [{ id: assignedTo.id, name: assignedTo.name, email: assignedTo.email }]
    };
  }
  
  // Case 2: No specific assignee, find all admin users
  console.log("No specific assignee, searching for admins");
  
  // Get all admin users to notify
  const { data: adminUsers, error: adminError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  
  if (adminError) {
    console.error("Failed to fetch admin users:", adminError);
    return { success: false, error: `Failed to fetch admin users: ${adminError.message}` };
  }
  
  if (!adminUsers || adminUsers.length === 0) {
    console.error("No admin users found");
    return { success: false, error: "No admin users found to notify" };
  }
  
  console.log(`Found ${adminUsers.length} admin users`);
  
  // Get profile information for each admin
  const adminIds = adminUsers.map(user => user.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", adminIds);
  
  if (profilesError) {
    console.error("Failed to fetch admin profiles:", profilesError);
    return { success: false, error: `Failed to fetch admin profiles: ${profilesError.message}` };
  }
  
  if (!profiles || profiles.length === 0) {
    console.error("No admin profiles found");
    return { success: false, error: "No admin profiles found to notify" };
  }
  
  console.log(`Found ${profiles.length} admin profiles`);
  
  // Ensure all emails are valid
  const validProfiles: ManagerProfile[] = profiles
    .filter(profile => profile.email && profile.email.includes('@'))
    .filter(profile => profile.id !== actor.id); // Don't notify the actor
  
  if (validProfiles.length === 0) {
    console.error("No admin profiles with valid emails found");
    return { success: false, error: "No admin profiles with valid emails found" };
  }
  
  console.log(`Found ${validProfiles.length} valid admin profiles to notify`);
  
  // Send notifications to all admins
  const notificationResults = await Promise.all(
    validProfiles.map(async (profile) => {
      return sendAdminNotification(supabase, profile, actor, details);
    })
  );
  
  const failures = notificationResults.filter(result => !result.success);
  if (failures.length > 0) {
    console.warn(`${failures.length} notifications failed to send`);
  }
  
  return { 
    success: true,
    notifiedManagers: validProfiles
  };
}

async function sendAdminNotification(
  supabase: SupabaseClient,
  admin: ManagerProfile,
  actor: NotificationRequest["actor"],
  details: NotificationRequest["details"]
) {
  try {
    console.log(`Sending admin notification to ${admin.name} (${admin.email})`);
    
    // Check for self-notification
    if (admin.id === actor.id || admin.email === actor.email) {
      console.warn(`Skipping self-notification for ${actor.email}`);
      return { success: false, error: "Cannot send notification to yourself" };
    }
    
    const response = await supabase.functions.invoke("send-admin-notification", {
      body: {
        adminEmail: admin.email,
        adminName: admin.name,
        type: "report",
        priority: details.priority || "high",
        employeeName: actor.name,
        details: {
          ...details,
          senderEmail: actor.email
        }
      },
    });

    if (response.error) {
      console.error(`Failed to send notification to ${admin.email}:`, response.error);
      return { success: false, error: response.error.message };
    }
    
    console.log(`Successfully sent notification to ${admin.email}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending notification to ${admin.email}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
