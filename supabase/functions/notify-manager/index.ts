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
      let validManagerIds = [];
      
      // First, check for direct assignments
      if (actor && actor.id) {
        console.log(`Looking for assignments for user ${actor.id}`);
        
        const { data: assignments, error: assignError } = await supabase
          .from("employee_assignments")
          .select("admin_id")
          .eq("employee_id", actor.id);
          
        if (assignError) {
          console.error("Error fetching assignments:", assignError);
        } else if (assignments && assignments.length > 0) {
          console.log(`Found ${assignments.length} direct assignments:`, assignments);
          
          // Add assigned admins to the valid managers list
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
        
        validManagerIds = managers.map(mgr => mgr.user_id);
        console.log(`Found ${validManagerIds.length} managers/admins in total`);
      }
      
      // Filter out the sender
      validManagerIds = validManagerIds.filter(id => id !== actor.id);
        
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
      
      console.log(`Will notify ${validManagerIds.length} managers/admins:`, validManagerIds);
      
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
      
      console.log("Found manager profiles:", managerProfiles);
      
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

      if (insertErr) {
        console.error("Error inserting notifications:", insertErr);
        throw insertErr;
      }
      
      console.log(`Successfully created ${notifications.length} notifications`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully sent ${notifications.length} notifications to managers/admins`,
        notifiedManagers: managerProfiles.map(m => m.name)
      }), { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } else {
      let notifications = [];
      
      if (actionType === "time_off_request") {
        // Find manager(s) in the same department (for demo: any user with role "manager")
        const { data: managers, error: mgrErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "manager");

        if (mgrErr) throw mgrErr;

        if (!managers || managers.length === 0) {
          return new Response(JSON.stringify({ error: "No managers found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
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
        return new Response(JSON.stringify({ 
          success: true, 
          message: "No notifications to send" 
        }), { 
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
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
      }), { 
        status: 200, 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
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
