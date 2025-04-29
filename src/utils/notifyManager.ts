
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
    if (assignedTo && (!assignedTo.email || !assignedTo.email.includes('@'))) {
      console.error(`[NotifyManager] Invalid email for assignedTo: ${assignedTo.email}`);
      return { 
        success: false, 
        error: `Invalid email format for assigned user: ${assignedTo.email}`,
        invalidEmail: true
      };
    }
    
    // Add more debugging to help trace issues
    console.log(`[NotifyManager] Making request to notify-manager function with actor: ${actor.name} (${actor.email})`);
    
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
