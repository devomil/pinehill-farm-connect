
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a shift coverage request - Simplified for reliability
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
    // Insert directly into the database
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .insert(insertData)
      .select();
    
    if (error) {
      console.error("Error creating shift coverage request:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned from insert");
      throw new Error("Failed to create shift coverage request");
    }
    
    console.log("Shift coverage request created successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Exception creating shift coverage request:", error);
    throw error;
  }
}

/**
 * Verifies a shift coverage request was created
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
      console.log("Verification successful - found request:", requestData);
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
    
    // Check if the table exists and has data
    const { count, error: countError } = await supabase
      .from('shift_coverage_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error("Error accessing shift_coverage_requests table:", countError);
      return { verified: false, error: countError };
    }
    
    console.log("Total shift coverage requests in database:", count);
    return { verified: false, reason: "Request not found" };
  } catch (error) {
    console.error("Error verifying shift coverage request:", error);
    return { verified: false, error };
  }
}
