
import { createShiftCoverageRequest } from './shiftCoverageCreate';
import { verifyShiftCoverageRequest } from './shiftCoverageVerify';

/**
 * Main service file for handling shift coverage operations
 * Acts as a facade to coordinate the various specialized services
 */
export async function handleShiftCoverageDetails(
  communicationId: string,
  shiftDetails: {
    original_employee_id: string;
    covering_employee_id: string;
    shift_date: string;
    shift_start: string;
    shift_end: string;
  },
  originalEmployeeId: string,
  coveringEmployeeId: string
) {
  try {
    // Validate inputs for safety
    if (!communicationId) {
      throw new Error('Communication ID is required to create a shift coverage request');
    }

    if (!shiftDetails.shift_date || !shiftDetails.shift_start || !shiftDetails.shift_end) {
      throw new Error('Incomplete shift details provided');
    }
    
    // Create the shift coverage request
    const request = await createShiftCoverageRequest(communicationId, {
      ...shiftDetails,
      original_employee_id: shiftDetails.original_employee_id || originalEmployeeId,
      covering_employee_id: shiftDetails.covering_employee_id || coveringEmployeeId
    });
    
    // Verify the request was created successfully
    const verification = await verifyShiftCoverageRequest(
      communicationId,
      shiftDetails.shift_date,
      shiftDetails.original_employee_id || originalEmployeeId
    );
    
    return {
      request,
      verification
    };
  } catch (error) {
    console.error('Error handling shift coverage details:', error);
    throw error;
  }
}

// Re-export the functions for backward compatibility
export { createShiftCoverageRequest, verifyShiftCoverageRequest };
