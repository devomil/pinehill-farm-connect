import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { actionType, actor, details } = await req.json();
    
    console.log(`Processing notification: ${actionType}`, { actor, details });
    
    if (actionType === "shift_report") {
      // Get all managers and admins
      const { data: managers, error: mgrErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["manager", "admin"]);

      if (mgrErr) throw mgrErr;
      
      if (!managers || managers.length === 0) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No managers or admins found" 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      
      // Filter out the sender
      const validManagerIds = managers
        .map(mgr => mgr.user_id)
        .filter(id => id !== actor.id);
        
      if (validManagerIds.length === 0) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No eligible managers found (excluding the sender)" 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      
      // Get profiles for the managers
      const { data: managerProfiles, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", validManagerIds);
        
      if (profilesErr) throw profilesErr;
      
      if (!managerProfiles || managerProfiles.length === 0) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No manager profiles found" 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      
      // Create notifications for all valid managers
      const notifications = managerProfiles.map(manager => ({
        user_id: manager.id,
        type: actionType,
        message: `Employee ${actor.name} submitted a ${details.priority || "high"} priority report.`,
        data: { actor, details },
      }));
      
      // Insert notifications
      const { error: insertErr } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertErr) throw insertErr;
      
      console.log(`Successfully created ${notifications.length} notifications`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully sent ${notifications.length} notifications to managers/admins` 
      }), { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } 
    else if (actionType === "time_off_request") {
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

      notifications = managers.map((mgr) => ({
        user_id: mgr.user_id,
        type: actionType,
        message: `Employee ${actor.name} requested time off.`,
        data: { actor, details },
      }));
    } 
    else if (actionType === "event_created") {
      // Handle notifications for event creation
      let userIds = [];
      
      // If recipients is "all", notify everyone
      if (details.recipients === "all") {
        const { data: allUsers, error: usersErr } = await supabase
          .from("user_roles")
          .select("user_id");
        
        if (usersErr) throw usersErr;
        userIds = allUsers.map(u => u.user_id);
      } else {
        // Otherwise use the specified recipient list
        userIds = details.recipients;
      }
      
      notifications = userIds
        .filter(id => id !== actor.id) // Don't notify the creator
        .map(userId => ({
          user_id: userId,
          type: actionType,
          message: `${actor.name} added a new event: ${details.event.title}`,
          data: { actor, event: details.event },
        }));
    }
    else if (actionType === "training_assigned") {
      // Notifications for training assignments
      const userIds = details.assignedUserIds;
      const trainingTitle = details.trainingTitle;
      
      notifications = userIds.map(userId => ({
        user_id: userId,
        type: actionType,
        message: `You've been assigned a new training: ${trainingTitle}`,
        data: { 
          actor, 
          trainingId: details.trainingId,
          trainingTitle: trainingTitle
        },
      }));
    }
    else {
      // Generic fallback for other action types
      console.log(`Unhandled action type: ${actionType}`);
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Unhandled action type: ${actionType}` 
      }), { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    if (notifications.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No notifications to send" }), { status: 200 });
    }

    // Insert notifications
    const { error: insertErr } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertErr) throw insertErr;
    
    console.log(`Successfully created ${notifications.length} notifications`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully sent ${notifications.length} notifications` 
    }), { status: 200 });
  } catch (e) {
    console.error("Error processing notification:", e);
    return new Response(JSON.stringify({ 
      error: e.message 
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
