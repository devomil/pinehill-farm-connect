
import { User } from "@/types";
import { findAdminForMessage } from "../../data/messageDataService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for finding admin data for communications
 */
export async function findAdminForCommunication(
  currentUser: User,
  messageType: string,
  adminCc?: string | null
) {
  // Only look for an admin if this is a shift coverage request
  if (messageType === 'shift_coverage') {
    console.log("Looking for admin to CC for shift coverage request");
    
    try {
      // If adminCc is provided and looks like a UUID, use it directly
      if (adminCc && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminCc)) {
        // Verify the admin exists with this ID
        const { data: adminData, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', adminCc)
          .maybeSingle();
          
        if (!error && adminData) {
          console.log("Using provided admin ID:", adminData);
          return adminData;
        } else {
          console.log("Provided admin ID not found, falling back to lookup");
        }
      }
      
      // If explicit adminCc email was provided but isn't a UUID, try to look it up
      if (adminCc && adminCc.includes('@')) {
        const { data: adminByEmail } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('email', adminCc)
          .maybeSingle();
          
        if (adminByEmail) {
          console.log("Found admin by email:", adminByEmail);
          return adminByEmail;
        }
      }
      
      // Fallback to looking up Jackie specifically for shift coverage
      if (messageType === 'shift_coverage') {
        const { data: jackieAdmin } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('email', 'jackie@pinehillfarm.co')
          .maybeSingle();
          
        if (jackieAdmin) {
          console.log("Found Jackie as admin:", jackieAdmin);
          return jackieAdmin;
        }
      }
      
      // Last resort: use general admin lookup
      const adminData = await findAdminForMessage(currentUser, adminCc || undefined);
      console.log("Admin data for CC from general lookup:", adminData);
      return adminData;
      
    } catch (error) {
      console.error("Failed to find admin for message:", error);
      // Don't throw here - a missing admin is not a critical error
      return null;
    }
  }
  return null;
}
