
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds recipient data by ID
 */
export async function getRecipientData(recipientId: string) {
  console.log("Fetching recipient data for ID:", recipientId);
  
  if (!recipientId) {
    console.error("No recipient ID provided");
    throw new Error("No recipient ID provided");
  }

  try {
    // Try getting the recipient with a more detailed query
    const { data: recipientData, error: recipientError } = await supabase
      .from('profiles')
      .select('id, name, email, updated_at')
      .eq('id', recipientId)
      .maybeSingle();

    if (recipientError) {
      console.error("Error fetching recipient data:", recipientError);
      throw new Error(`Database error when finding recipient: ${recipientError.message}`);
    }

    if (!recipientData) {
      console.error(`No recipient found with ID: ${recipientId}`);
      
      // Try a broader search with a LIKE query on string representation of ID
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
        .limit(5);
        
      console.log("Sample profiles for debugging:", sampleProfiles);
      
      throw new Error(`Recipient not found in database. Please refresh employee data and try again.`);
    }
    
    console.log("Found recipient:", recipientData);
    return recipientData;
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
  }
  
  // If no admin found yet, fall back to the employee's assigned admin
  if (!adminData && currentUser?.id) {
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
  }
  
  return null;
}
