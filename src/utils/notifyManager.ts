
export async function notifyManager(actionType: string, actor: { id: string; name: string; email: string }, details: any) {
  try {
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
      console.error("[NotifyManager] Error:", errorText);
      return { success: false, error: errorText };
    }
    
    return { success: true };
  } catch (error) {
    console.error("[NotifyManager] Exception:", error);
    return { success: false, error: error.message };
  }
}
