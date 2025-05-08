
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
