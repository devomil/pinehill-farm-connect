
import { supabase } from "@/integrations/supabase/client";

export async function notifyManager(
  actionType: string, 
  actor: { id: string; name: string; email: string }, 
  details: any,
  assignedTo?: { id: string; name: string; email: string }
) {
  try {
    console.log(`[NotifyManager] Sending notification for ${actionType}`, { 
      actor, 
      details, 
      assignedTo: assignedTo ? {
        id: assignedTo.id,
        name: assignedTo.name,
        email: assignedTo.email
      } : 'none'
    });
    
    // Add validation to prevent sending to the actor's own email
    if (actionType === "shift_report") {
      details.senderEmail = actor.email; // Add sender email for validation
    }
    
    // Validate assignedTo email if present
    if (assignedTo) {
      // Ensure email has a domain
      if (assignedTo.email && !assignedTo.email.includes('@')) {
        console.log(`[NotifyManager] Email missing domain, adding domain: ${assignedTo.email} -> ${assignedTo.email}@pinehillfarm.co`);
        assignedTo.email = `${assignedTo.email}@pinehillfarm.co`;
      }
      
      // Validate email format
      if (!assignedTo.email || !assignedTo.email.includes('@')) {
        console.error(`[NotifyManager] Invalid email for assignedTo: ${assignedTo.email}`);
        
        // Don't attempt to auto-fix emails at this level, just return an error
        return { 
          success: false, 
          error: `Invalid email format for assigned user: ${assignedTo.email}`,
          invalidEmail: true
        };
      }
      
      // Verify we're not sending to the actor's own email
      if (assignedTo.email === actor.email || assignedTo.id === actor.id) {
        console.error(`[NotifyManager] Cannot send notification to yourself: ${actor.email}`);
        return { 
          success: false, 
          error: `Cannot send notification to yourself`,
          selfNotification: true
        };
      }
      
      // Ensure we're using the correct recipient
      console.log(`[NotifyManager] Using specified recipient: ${assignedTo.name} (${assignedTo.email}) with ID: ${assignedTo.id}`);
    }
    
    // Prepare the request payload
    const payload = { 
      actionType, 
      actor, 
      details, 
      assignedTo 
    };
    
    // Log the full request payload
    console.log(`[NotifyManager] Request payload:`, JSON.stringify(payload, null, 2));
    
    // Use the correct URL with the project ID
    const res = await fetch(
      "https://pdeaxfhsodenefeckabm.functions.supabase.co/notify-manager",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Use the anon key directly instead of process.env
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZWF4Zmhzb2RlbmVmZWNrYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzIxNTcsImV4cCI6MjA2MDkwODE1N30.Na375_2UPefjCbmBLrWWwhX0G6QhZuyrUxgQieV1TlA`
        },
        body: JSON.stringify(payload),
      }
    );
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[NotifyManager] Server returned error (${res.status}):`, errorText);
      return { 
        success: false, 
        error: `Server error (${res.status}): ${errorText}`,
        statusCode: res.status
      };
    }
    
    const data = await res.json();
    console.log("[NotifyManager] Success:", data);
    
    return { 
      success: true,
      data
    };
  } catch (error) {
    console.error("[NotifyManager] Network or parsing exception:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      exception: true
    };
  }
}
