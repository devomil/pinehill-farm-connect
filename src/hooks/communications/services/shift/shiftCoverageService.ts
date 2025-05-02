
import { supabase } from "@/integrations/supabase/client";
import { validateEmployeeExists } from "../recipient/recipientLookupService";

/**
 * Service for handling shift coverage requests
 * Completely rewritten for reliability
 */
export async function handleShiftCoverageDetails(
  communicationId: string,
  shiftDetails: any,
  currentUserId: string,
  recipientId: string
) {
  console.log(`Creating shift coverage request for communication ${communicationId}`);
  
  // Validate shift details
  if (!validateShiftDetails(shiftDetails)) {
    console.error("Invalid shift details:", shiftDetails);
    throw new Error("Missing required shift details");
  }
  
  try {
    // Get employee IDs from parameters or details
    const originalEmployeeId = shiftDetails.original_employee_id || currentUserId;
    const coveringEmployeeId = shiftDetails.covering_employee_id || recipientId;
    
    console.log("Original employee ID:", originalEmployeeId);
    console.log("Covering employee ID:", coveringEmployeeId);
    
    // Validate both employees exist
    const [originalUserExists, coveringUserExists] = await Promise.all([
      validateEmployeeExists(originalEmployeeId),
      validateEmployeeExists(coveringEmployeeId)
    ]);
    
    if (!originalUserExists) {
      throw new Error("Your user profile was not found in the system. Please try again.");
    }
    
    if (!coveringUserExists) {
      throw new Error("The selected employee could not be verified in the system.");
    }
    
    console.log("Both employees validated successfully");
    
    // Create shift coverage request
    const shiftCoverageData = {
      communication_id: communicationId,
      original_employee_id: originalEmployeeId,
      covering_employee_id: coveringEmployeeId,
      shift_date: shiftDetails.shift_date,
      shift_start: shiftDetails.shift_start,
      shift_end: shiftDetails.shift_end,
      status: 'pending'
    };
    
    console.log("Inserting shift coverage with data:", JSON.stringify(shiftCoverageData, null, 2));
    
    // Use direct insert with error handling
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .insert(shiftCoverageData)
      .select();
    
    if (error) {
      console.error("Database error creating shift coverage request:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after insert");
      throw new Error("Failed to create shift coverage request - no data returned");
    }
    
    console.log("Successfully created shift coverage request:", data[0]);
    
    // Verify the request was created
    const verificationResult = await verifyShiftCoverageRequest(communicationId);
    
    if (!verificationResult.verified) {
      console.warn("Could not verify shift request was saved, but insert succeeded");
      // Continue anyway since the insert was successful
    }
    
    return data[0];
  } catch (error: any) {
    console.error("Error creating shift coverage request:", error);
    throw new Error(`Failed to create shift coverage request: ${error.message}`);
  }
}

/**
 * Validates shift details to ensure all required fields are present
 */
function validateShiftDetails(shiftDetails: any): boolean {
  if (!shiftDetails) {
    return false;
  }
  
  // Check for all required fields
  return Boolean(
    shiftDetails.shift_date && 
    shiftDetails.shift_start && 
    shiftDetails.shift_end
  );
}

/**
 * Verifies a shift coverage request exists in the database
 */
export async function verifyShiftCoverageRequest(communicationId: string) {
  console.log("Verifying shift coverage request for communication:", communicationId);
  
  try {
    // Direct query by communication ID
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .select('*')
      .eq('communication_id', communicationId);
    
    if (error) {
      console.error("Error verifying shift coverage request:", error);
      return { verified: false, error };
    }
    
    if (data && data.length > 0) {
      console.log("✅ Verification successful - shift coverage exists:", data[0]);
      return { verified: true, data };
    }
    
    console.warn("⚠️ Could not verify shift request was saved - not found");
    return { verified: false, reason: "Request not found" };
  } catch (error) {
    console.error("Exception during verification:", error);
    return { verified: false, error };
  }
}
