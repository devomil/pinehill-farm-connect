
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, userData } = await req.json()

    // Create the user
    const { data: user, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData
    })

    if (createError) {
      throw createError
    }

    // Assign initial role
    const { error: roleError } = await supabaseClient.from('user_roles').insert({
      user_id: user.user.id,
      role: 'employee'
    })

    if (roleError) {
      console.error("Error inserting user role:", roleError);
      throw roleError;
    }

    // Manually ensure the profiles table has the user data
    const { error: profileError } = await supabaseClient.from('profiles').insert({
      id: user.user.id,
      name: userData.name,
      email: email,
      department: userData.department,
      position: userData.position
    });

    if (profileError) {
      console.error("Error inserting profile:", profileError);
      // Don't throw here - we'll try to get it created via the trigger
    }

    console.log(`User created successfully with ID: ${user.user.id}`);
    
    // Verify the profile was created or try to update it
    const { data: profileData, error: getProfileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (getProfileError || !profileData) {
      console.log("Profile not found after creation, trying to create it again");
      // Try a different approach if the profile doesn't exist
      await supabaseClient.from('profiles').upsert({
        id: user.user.id,
        name: userData.name,
        email: email,
        department: userData.department || '',
        position: userData.position || ''
      });
    }

    return new Response(
      JSON.stringify({ user: user.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error in admin-create-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
