
import { createShiftCoverageRequest, verifyShiftCoverageRequest } from "../../data/messageDataService";

/**
 * Service for handling shift coverage requests
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
    // Create shift coverage request with explicit IDs
    const fullShiftDetails = {
      original_employee_id: shiftDetails.original_employee_id || currentUserId,
      covering_employee_id: shiftDetails.covering_employee_id || recipientId,
      shift_date: shiftDetails.shift_date,
      shift_start: shiftDetails.shift_start,
      shift_end: shiftDetails.shift_end,
      communication_id: communicationId
    };
    
    console.log("Creating shift coverage with details:", JSON.stringify(fullShiftDetails, null, 2));
    
    const shiftRequestData = await createShiftCoverageRequest(
      communicationId,
      fullShiftDetails
    );
    
    console.log("Shift coverage request created successfully:", shiftRequestData);
    
    // Verify the request was created after a short delay
    setTimeout(async () => {
      console.log("Verifying shift coverage request was created");
      try {
        const verificationResult = await verifyShiftCoverageRequest(
          communicationId, 
          shiftDetails.shift_date,
          shiftDetails.original_employee_id || currentUserId
        );
        
        console.log("Verification result:", verificationResult);
      } catch (error) {
        console.error("Error verifying shift coverage request:", error);
      }
    }, 1000);
    
    return shiftRequestData;
  } catch (error: any) {
    console.error("Error creating shift coverage request:", error);
    console.error("Error details:", error.message, error.code);
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
  
  return Boolean(
    shiftDetails.shift_date && 
    shiftDetails.shift_start && 
    shiftDetails.shift_end
  );
}
