
// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://supabase.com/docs/guides/functions/deno-runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL or service role key not found in environment');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all profiles bypassing RLS
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, department, position, employeeId, updated_at');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log successful operation
    console.log(`Successfully fetched and enhanced ${profiles.length} profiles`);
    
    // Log some sample profiles for debugging
    profiles.slice(0, 5).forEach(profile => {
      console.log(`Profile: ${profile.name} | Email: ${profile.email}`);
    });
    
    // Return the enhanced profiles
    return new Response(
      JSON.stringify(profiles),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get_all_profiles function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
