
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
    }
    
    // Add more debugging to help trace issues
    console.log(`[NotifyManager] Making request to notify-manager function with actor: ${actor.name} (${actor.email}), sending to: ${assignedTo?.email || 'none'}`);
    
    // Log the full request payload
    console.log(`[NotifyManager] Request payload:`, JSON.stringify({ 
      actionType, 
      actor, 
      details, 
      assignedTo 
    }, null, 2));
    
    const res = await fetch(
      "https://pdeaxfhsodenefeckabm.functions.supabase.co/notify-manager",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType, actor, details, assignedTo }),
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
