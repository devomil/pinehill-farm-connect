
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

    console.log("Creating user with data:", { email, userData })

    // Create the user
    const { data: user, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData
    })

    if (createError) {
      console.error("Error creating user:", createError)
      throw createError
    }

    console.log("User created successfully:", user)

    // Assign admin role
    const { error: roleError } = await supabaseClient.from('user_roles').insert({
      user_id: user.user.id,
      role: 'admin'  // Set as admin
    })

    if (roleError) {
      console.error("Error inserting user role:", roleError)
      throw roleError
    }

    console.log("Admin role assigned successfully")

    // Create profile
    const { error: profileError } = await supabaseClient.from('profiles').insert({
      id: user.user.id,
      name: userData.name,
      email: email,
      department: userData.department || 'Management',
      position: userData.position || 'Super Admin'
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Don't throw here - profile might be created by trigger
    }

    // Verify profile was created
    const { data: profile, error: getProfileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()

    if (getProfileError || !profile) {
      console.log("Profile not found, trying to create again")
      await supabaseClient.from('profiles').upsert({
        id: user.user.id,
        name: userData.name,
        email: email,
        department: 'Management',
        position: 'Super Admin'
      })
    }

    console.log("Super admin user creation completed successfully")

    return new Response(
      JSON.stringify({ user: user.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error in admin-create-user:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
