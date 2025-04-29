
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { ManagerProfile, NotificationRequest } from "./notificationTypes.ts";

export async function handleShiftReport(
  supabase: ReturnType<typeof createClient>,
  request: NotificationRequest
): Promise<{ success: boolean; notifiedManagers?: ManagerProfile[]; error?: string }> {
  let validManagerIds: string[] = [];
  
  // If there's a specific assignee, prioritize them
  if (request.assignedTo?.id) {
    console.log(`Report specifically assigned to user ${request.assignedTo.id}`);
    validManagerIds = [request.assignedTo.id];
  }
  // Otherwise check for direct assignments
  else if (request.actor?.id) {
    console.log(`Looking for assignments for user ${request.actor.id}`);
    
    const { data: assignments, error: assignError } = await supabase
      .from("employee_assignments")
      .select("admin_id")
      .eq("employee_id", request.actor.id);
      
    if (assignError) {
      console.error("Error fetching assignments:", assignError);
    } else if (assignments && assignments.length > 0) {
      console.log(`Found ${assignments.length} direct assignments:`, assignments);
      validManagerIds = assignments.map(a => a.admin_id).filter(Boolean);
      console.log("Adding assigned admins to notification list:", validManagerIds);
    } else {
      console.log("No direct assignments found for this user");
    }
  }
  
  // If no direct assignments found or as a fallback, get all managers and admins
  if (validManagerIds.length === 0) {
    console.log("Falling back to all managers/admins");
    
    const { data: managers, error: mgrErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["manager", "admin"]);

    if (mgrErr) {
      console.error("Error fetching managers:", mgrErr);
      throw mgrErr;
    }
    
    if (!managers || managers.length === 0) {
      return { success: false, error: "No managers or admins found" };
    }
    
    validManagerIds = managers.map(mgr => mgr.user_id);
    console.log(`Found ${validManagerIds.length} managers/admins in total`);
  }
  
  // Filter out the sender
  validManagerIds = validManagerIds.filter(id => id !== request.actor.id);
  
  if (validManagerIds.length === 0) {
    return { 
      success: false,
      error: "No eligible managers found (excluding the sender)" 
    };
  }
  
  // Get profiles for the managers
  const { data: managerProfiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("id, email, name")
    .in("id", validManagerIds);
    
  if (profilesErr) {
    console.error("Error fetching manager profiles:", profilesErr);
    throw profilesErr;
  }
  
  if (!managerProfiles || managerProfiles.length === 0) {
    return { success: false, error: "No manager profiles found" };
  }

  // Validate emails in profiles - log warning for any invalid emails
  const validProfiles = managerProfiles.filter(profile => {
    const isValid = profile.email && profile.email.includes('@');
    if (!isValid) {
      console.warn(`Manager profile ${profile.id} (${profile.name}) has invalid email: ${profile.email}`);
    }
    return isValid;
  });
  
  if (validProfiles.length === 0) {
    return { success: false, error: "No manager profiles with valid emails found" };
  }
  
  console.log(`Found ${validProfiles.length} manager profiles with valid emails`);
  
  return { success: true, notifiedManagers: validProfiles };
}
