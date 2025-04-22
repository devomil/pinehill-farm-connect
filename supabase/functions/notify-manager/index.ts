
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { actionType, actor, details } = await req.json();
    // actionType: "time_off_request", etc.
    // actor: { id, name, email }
    // details: { ... }

    // Find manager(s) in the same department (for demo: any user with role "manager")
    const { data: managers, error: mgrErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "manager");

    if (mgrErr) throw mgrErr;

    if (!managers || managers.length === 0) {
      return new Response(JSON.stringify({ error: "No managers found" }), {
        status: 404,
      });
    }

    const notifications = managers.map((mgr) => ({
      user_id: mgr.user_id,
      type: actionType,
      message: `Employee ${actor.name} requested time off.`,
      data: { actor, details },
    }));

    // Insert notifications
    const { error: insertErr } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
