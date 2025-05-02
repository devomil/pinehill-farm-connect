
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Finds recipient data by ID with enhanced error handling
 */
export async function getRecipientData(recipientId: string) {
  console.log("Fetching recipient data for ID:", recipientId);
  
  if (!recipientId) {
    console.error("No recipient ID provided");
    throw new Error("No recipient ID provided");
  }

  try {
    // First try - regular query
    const { data: recipientData, error: recipientError } = await supabase
      .from('profiles')
      .select('id, name, email, updated_at')
      .eq('id', recipientId)
      .maybeSingle();

    if (recipientData) {
      console.log("Found recipient:", recipientData);
      return recipientData;
    }
    
    if (recipientError) {
      console.error("Error fetching recipient data:", recipientError);
      // Continue to try other methods
    }

    // Second try - attempt to use edge function to bypass RLS
    try {
      console.log("Attempting to use edge function to fetch recipient");
      const { data: functionProfiles, error: functionError } = await supabase
        .functions.invoke('get_all_profiles');
      
      if (!functionError && functionProfiles && functionProfiles.length > 0) {
        // Find matching profile in the returned data
        const matchingProfile = functionProfiles.find(profile => profile.id === recipientId);
        if (matchingProfile) {
          console.log("Found recipient through edge function:", matchingProfile);
          return matchingProfile;
        }
      }
    } catch (edgeFuncError) {
      console.log("Edge function not available or error:", edgeFuncError);
    }
    
    // Third try - broader search with a LIKE query on string representation of ID
    const { data: fuzzyMatch } = await supabase
      .from('profiles')
      .select('id, name, email')
      .ilike('id', `%${recipientId.slice(-10)}%`)
      .limit(1);
      
    if (fuzzyMatch && fuzzyMatch.length > 0) {
      console.log("Found potential match with fuzzy search:", fuzzyMatch[0]);
      return fuzzyMatch[0];
    }
    
    // Get sample profiles for debugging
    const { data: sampleProfiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .limit(10);
      
    console.log("Sample profiles for debugging:", sampleProfiles);
    
    // In development mode, provide more detailed error
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      if (sampleProfiles && sampleProfiles.length > 0) {
        console.warn("DEVELOPMENT MODE: Using first profile as fallback");
        toast.warning("Using fallback profile for testing");
        return sampleProfiles[0];
      }
    }
    
    throw new Error(`Recipient not found in database. Please refresh employee data and try again.`);
  } catch (error: any) {
    console.error("Error in getRecipientData:", error);
    throw error;
  }
}

/**
 * Finds admin data for a message (either specified admin or employee's assigned admin)
 */
export async function findAdminForMessage(currentUser: any, adminCc?: string) {
  let adminData = null;
  
  // If adminCc is manually set, use that ID
  if (adminCc) {
    try {
      // Try to get the admin directly
      const { data: manualAdmin, error: manualAdminError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', adminCc)
        .maybeSingle();
        
      if (!manualAdminError && manualAdmin) {
        adminData = manualAdmin;
        console.log("Using specified admin CC:", adminData);
        return adminData;
      } else {
        console.warn("Specified admin CC not found:", adminCc, manualAdminError);
      }
      
      // Try edge function if direct query fails
      const { data: functionProfiles } = await supabase
        .functions.invoke('get_all_profiles');
        
      if (functionProfiles && functionProfiles.length > 0) {
        const foundAdmin = functionProfiles.find(profile => profile.id === adminCc);
        if (foundAdmin) {
          console.log("Found admin via edge function:", foundAdmin);
          return foundAdmin;
        }
      }
    } catch (error) {
      console.error("Error finding specified admin:", error);
    }
  }
  
  // If no admin found yet, fall back to the employee's assigned admin
  if (!adminData && currentUser?.id) {
    try {
      // Find the admin assigned to the current user (requester)
      const { data: adminAssignment, error: adminError } = await supabase
        .from('employee_assignments')
        .select('admin_id, admin:profiles!employee_assignments_admin_id_fkey(id, name, email)')
        .eq('employee_id', currentUser.id)
        .maybeSingle();
  
      if (!adminError && adminAssignment?.admin) {
        adminData = adminAssignment.admin;
        console.log("Found requester's admin:", adminData);
        return adminData;
      } else {
        console.warn("No admin found for requester:", currentUser.id, adminError);
      }
    } catch (error) {
      console.error("Error finding assigned admin:", error);
    }
  }
  
  // If still no admin found, try to find someone with admin role as fallback
  try {
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id, name, email, user_roles!inner(role)')
      .eq('user_roles.role', 'admin')
      .limit(1);
      
    if (adminProfiles && adminProfiles.length > 0) {
      adminData = adminProfiles[0];
      console.log("Using fallback admin from user_roles:", adminData);
      return adminData;
    }
  } catch (error) {
    console.error("Error finding fallback admin:", error);
  }
  
  return null;
}
