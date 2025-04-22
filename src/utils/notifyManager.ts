
export async function notifyManager(actionType: string, actor: { id: string; name: string; email: string }, details: any) {
  const res = await fetch(
    "https://pdeaxfhsodenefeckabm.functions.supabase.co/notify-manager",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType, actor, details }),
    }
  );
  if (!res.ok) {
    console.error("[NotifyManager] Error:", await res.text());
  }
}
