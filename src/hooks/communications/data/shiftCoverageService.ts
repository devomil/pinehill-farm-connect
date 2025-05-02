
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a shift coverage request - Optimized and simplified approach
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
  // Add additional logging before insert
  console.log("===== CREATING SHIFT COVERAGE REQUEST =====");
  console.log("Communication ID:", communicationId);
  console.log("Original employee:", shiftDetails.original_employee_id);
  console.log("Covering employee:", shiftDetails.covering_employee_id);
  console.log("Shift date:", shiftDetails.shift_date);
  console.log("Shift time:", `${shiftDetails.shift_start} - ${shiftDetails.shift_end}`);
  
  // Prepare shift coverage request payload
  const shiftPayload = {
    communication_id: communicationId,
    original_employee_id: shiftDetails.original_employee_id,
    covering_employee_id: shiftDetails.covering_employee_id,
    shift_date: shiftDetails.shift_date,
    shift_start: shiftDetails.shift_start,
    shift_end: shiftDetails.shift_end,
    status: 'pending'
  };
  
  console.log("Sending shift coverage request payload:", JSON.stringify(shiftPayload, null, 2));
  
  try {
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .insert(shiftPayload)
      .select();
    
    if (error) {
      console.error("Supabase Error creating shift coverage request:", error);
      console.error("Error details:", error.details, error.hint, error.message);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after insert");
      throw new Error("No data returned after insert");
    }
    
    console.log("Successfully created shift coverage request:", data);
    return data;
  } catch (e: any) {
    console.error("Exception creating shift coverage request:", e);
    // Use a direct fetch call as a fallback
    try {
      console.log("Attempting direct API call to create shift coverage request");
      
      // Use direct fetch without accessing protected properties
      const response = await fetch(
        "https://pdeaxfhsodenefeckabm.supabase.co/rest/v1/shift_coverage_requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZWF4Zmhzb2RlbmVmZWNrYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzIxNTcsImV4cCI6MjA2MDkwODE1N30.Na375_2UPefjCbmBLrWWwhX0G6QhZuyrUxgQieV1TlA",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(shiftPayload)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Direct API call failed with status: ${response.status}`);
      }
      
      const directData = await response.json();
      console.log("Direct API call successful:", directData);
      return directData;
    } catch (directError: any) {
      console.error("Direct API call failed:", directError);
      throw new Error(`Failed to create shift coverage request: ${directError.message}`);
    }
  }
}

/**
 * Verifies a shift coverage request was created
 */
export async function verifyShiftCoverageRequest(communicationId: string, shiftDate: string, originalEmployeeId: string) {
  // First check by communication ID
  const { data: checkData, error: checkError } = await supabase
    .from('shift_coverage_requests')
    .select('*')
    .eq('communication_id', communicationId);

  if (checkError) {
    console.error("Error verifying shift coverage request:", checkError);
    return { verified: false, error: checkError };
  }
  
  if (checkData && checkData.length > 0) {
    console.log("✅ Verification successful - shift coverage request exists:", checkData);
    return { verified: true, data: checkData };
  }
  
  // If not found by communication ID, try by date and employee
  const { data: allRecent, error: allRecentError } = await supabase
    .from('shift_coverage_requests')
    .select('*')
    .eq('original_employee_id', originalEmployeeId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (allRecentError) {
    console.error("Error checking recent shift requests:", allRecentError);
    return { verified: false, error: allRecentError };
  }
  
  // Find requests that match our date
  const matchingRequests = allRecent?.filter(req => 
    req.shift_date === shiftDate
  );
  
  if (matchingRequests && matchingRequests.length > 0) {
    console.log("✅ Found matching shift request by date:", matchingRequests[0]);
    return { verified: true, data: matchingRequests };
  }
  
  console.warn("⚠️ Could not verify shift request was saved - no matching requests found");
  
  // Perform a more detailed raw query using supabase's query builder
  try {
    console.log("Attempting additional detailed query to find the shift request");
    const { data: detailedCheck, error: detailedError } = await supabase
      .from('shift_coverage_requests')
      .select('*')
      .or(`communication_id.eq.${communicationId},original_employee_id.eq.${originalEmployeeId}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (detailedError) {
      console.error("Detailed query check failed:", detailedError);
    } else {
      console.log("Detailed query results:", detailedCheck);
      if (detailedCheck && detailedCheck.length > 0) {
        return { verified: true, data: detailedCheck };
      }
    }
  } catch (e) {
    console.log("Detailed check error:", e);
  }
  
  console.log("Recent shift requests:", allRecent);
  return { verified: false, data: allRecent };
}
