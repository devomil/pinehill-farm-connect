
import { createShiftCoverageRequest, verifyShiftCoverageRequest } from "../../data/messageDataService";
import { validateEmployeeExists } from "../recipient/recipientLookupService";

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
    // Verify both users exist in the system
    const originalEmployeeId = shiftDetails.original_employee_id || currentUserId;
    const coveringEmployeeId = shiftDetails.covering_employee_id || recipientId;
    
    console.log("Verifying original employee:", originalEmployeeId);
    console.log("Verifying covering employee:", coveringEmployeeId);
    
    // Run validations in parallel for better performance
    const [originalUserExists, coveringUserExists] = await Promise.all([
      validateEmployeeExists(originalEmployeeId),
      validateEmployeeExists(coveringEmployeeId)
    ]);
    
    if (!originalUserExists) {
      console.error("Original employee does not exist:", originalEmployeeId);
      throw new Error("Your user profile was not found. Please refresh the page and try again.");
    }
    
    if (!coveringUserExists) {
      console.error("Covering employee does not exist:", coveringEmployeeId);
      throw new Error("The selected employee could not be found. Please choose another employee.");
    }
    
    // Both users exist, proceed with creating the request
    console.log("Both employees validated successfully");
    
    // Create shift coverage request with explicit IDs
    const fullShiftDetails = {
      original_employee_id: originalEmployeeId,
      covering_employee_id: coveringEmployeeId,
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
    
    // Verify the request was created
    await verifyShiftCoverageRequest(
      communicationId, 
      shiftDetails.shift_date,
      originalEmployeeId
    );
    
    return shiftRequestData;
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
  
  return Boolean(
    shiftDetails.shift_date && 
    shiftDetails.shift_start && 
    shiftDetails.shift_end
  );
}
