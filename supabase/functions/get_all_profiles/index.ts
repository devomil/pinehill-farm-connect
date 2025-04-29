
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Use the service role to bypass RLS
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    // Validate and enhance profile data
    const enhancedProfiles = data.map(profile => {
      // Check if the profile has an email with an @ symbol
      if (!profile.email || !profile.email.includes('@')) {
        console.warn(`Profile ${profile.id} (${profile.name}) has invalid email: ${profile.email}`);
        
        // Add standard domain to emails without @ symbol
        if (profile.email && profile.email.trim() !== '') {
          const emailWithDomain = `${profile.email}@pinehillfarm.co`;
          console.log(`Adding domain to email for ${profile.name}: ${profile.email} -> ${emailWithDomain}`);
          profile.email = emailWithDomain;
        } else {
          // If no email is provided, create one based on the name
          if (profile.name && profile.name.trim() !== '') {
            const generatedEmail = `${profile.name.toLowerCase().replace(/\s+/g, '.')}@pinehillfarm.co`;
            console.log(`Generating email for ${profile.name}: ${generatedEmail}`);
            profile.email = generatedEmail;
          } else {
            // If all else fails, use a placeholder with the ID
            const fallbackEmail = `user.${profile.id.substring(0, 8)}@pinehillfarm.co`;
            console.log(`Using fallback email for profile ${profile.id}: ${fallbackEmail}`);
            profile.email = fallbackEmail;
          }
        }
      }
      
      return profile;
    });

    console.log(`Successfully fetched and enhanced ${enhancedProfiles?.length || 0} profiles`);
    
    return new Response(JSON.stringify(enhancedProfiles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in get_all_profiles function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
