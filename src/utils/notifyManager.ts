
export async function notifyManager(actionType: string, actor: { id: string; name: string; email: string }, details: any) {
  try {
    console.log(`[NotifyManager] Sending notification for ${actionType}`, { actor, details });
    
    const res = await fetch(
      "https://pdeaxfhsodenefeckabm.functions.supabase.co/notify-manager",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType, actor, details }),
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
