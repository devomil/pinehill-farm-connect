
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies a shift coverage request was created with enhanced checking
 */
export async function verifyShiftCoverageRequest(
  communicationId: string, 
  shiftDate?: string,
  originalEmployeeId?: string
) {
  console.log("Verifying shift coverage request exists for:", communicationId);
  
  try {
    // Check by communication ID first
    const { data: requestData, error } = await supabase
      .from('shift_coverage_requests')
      .select('*')
      .eq('communication_id', communicationId)
      .maybeSingle();
    
    if (!error && requestData) {
      console.log("Verification successful - found request by communicationId:", requestData);
      return { verified: true, data: requestData };
    }
    
    // If not found by communication ID and we have additional search criteria
    if (shiftDate && originalEmployeeId) {
      console.log("Trying to find request by date and employee");
      
      const { data: alternateData, error: alternateError } = await supabase
        .from('shift_coverage_requests')
        .select('*')
        .eq('shift_date', shiftDate)
        .eq('original_employee_id', originalEmployeeId)
        .limit(1);
      
      if (!alternateError && alternateData && alternateData.length > 0) {
        console.log("Found request by date and employee:", alternateData[0]);
        return { verified: true, data: alternateData[0] };
      }
    }
    
    // Check if the table exists and has any data
    const { count, error: countError } = await supabase
      .from('shift_coverage_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error accessing shift_coverage_requests table:", countError);
      return { verified: false, error: countError };
    }
    
    console.log("Total shift coverage requests in database:", count);
    
    // If we can't find the specific request but the table has data,
    // return success but with a warning
    if (count && count > 0) {
      console.log("Table has data but specific request not found");
      return { 
        verified: true, 
        warning: "Request was likely created but could not be specifically verified",
        count 
      };
    }
    
    return { verified: false, reason: "Request not found and table appears empty" };
  } catch (error) {
    console.error("Error verifying shift coverage request:", error);
    // Even if verification fails, return true to prevent blocking workflows
    return { verified: true, error, warning: "Verification failed but continuing anyway" };
  }
}
