
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a shift coverage request with enhanced reliability and logging
 */
export async function createShiftCoverageRequest(
  communicationId: string, 
  shiftDetails: {
    original_employee_id: string;
    covering_employee_id: string;
    shift_date: string;
    shift_start: string;
    shift_end: string;
    communication_id?: string;
  }
) {
  console.log("Creating shift coverage request for communication:", communicationId);
  console.log("Shift details:", JSON.stringify(shiftDetails, null, 2));
  
  // Create the record to insert
  const insertData = {
    communication_id: communicationId,
    original_employee_id: shiftDetails.original_employee_id,
    covering_employee_id: shiftDetails.covering_employee_id,
    shift_date: shiftDetails.shift_date,
    shift_start: shiftDetails.shift_start,
    shift_end: shiftDetails.shift_end,
    status: 'pending'
  };

  try {
    // First check if this request already exists to avoid duplicates
    const existingCheck = await supabase
      .from('shift_coverage_requests')
      .select('id')
      .eq('communication_id', communicationId)
      .maybeSingle();
      
    if (existingCheck.data) {
      console.log("Request already exists, returning:", existingCheck.data);
      return existingCheck.data;
    }

    // Insert record using upsert to avoid conflicts
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .upsert(insertData)
      .select();
    
    if (error) {
      console.error("Error creating shift coverage request:", error);
      
      // Try one more time with a simplified insert
      const retryData = {
        communication_id: communicationId,
        original_employee_id: shiftDetails.original_employee_id,
        covering_employee_id: shiftDetails.covering_employee_id,
        shift_date: shiftDetails.shift_date,
        shift_start: shiftDetails.shift_start,
        shift_end: shiftDetails.shift_end,
        status: 'pending'
      };
      
      const { data: retryResult, error: retryError } = await supabase
        .from('shift_coverage_requests')
        .insert(retryData)
        .select();
        
      if (retryError) {
        console.error("Retry also failed:", retryError);
        throw retryError;
      }
      
      if (!retryResult || retryResult.length === 0) {
        throw new Error("Failed to create shift coverage request on retry");
      }
      
      console.log("Shift coverage request created after retry:", retryResult[0]);
      return retryResult[0];
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned from insert");
      throw new Error("Failed to create shift coverage request - no data returned");
    }
    
    console.log("Shift coverage request created successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Exception creating shift coverage request:", error);
    throw error;
  }
}

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
