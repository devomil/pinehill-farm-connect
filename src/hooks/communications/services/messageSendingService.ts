
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/communicationTypes";
import { toast } from "sonner";
import { getRecipientData, findAdminForMessage, createCommunicationEntry, createShiftCoverageRequest, verifyShiftCoverageRequest } from "../data/messageDataService";
import { sendMessageNotification, validateShiftDetails } from "../utils/notificationUtils";

/**
 * Service for handling the entire message sending flow
 */
export async function sendMessageService(currentUser: User | null, params: SendMessageParams): Promise<any> {
  if (!currentUser?.id) {
    throw new Error("You must be logged in to send messages");
  }

  const { recipientId, message, type, shiftDetails, adminCc } = params;
  console.log(`Attempting to send message to recipient ID: ${recipientId}, type: ${type}`);
  
  // Verify recipient ID is provided
  if (!recipientId) {
    console.error("Missing recipient ID in request");
    throw new Error("Missing recipient ID. Please select a valid recipient.");
  }
  
  // CRITICAL FIX: Detailed validation and logging for shift coverage requests
  if (type === 'shift_coverage') {
    console.log("Processing shift coverage request with details:", JSON.stringify(shiftDetails, null, 2));
    
    if (!shiftDetails) {
      console.error("Missing shift details for shift coverage request");
      throw new Error("Missing shift details for coverage request");
    }
    
    // Validate shift details
    if (!validateShiftDetails(shiftDetails)) {
      console.error("Invalid shift details:", shiftDetails);
      throw new Error("Missing required shift details");
    }
    
    console.log("Shift details validation passed");
    console.log("Original employee ID:", shiftDetails.original_employee_id || currentUser.id);
    console.log("Covering employee ID:", shiftDetails.covering_employee_id || recipientId);
  }
  
  try {
    // Step 1: Find recipient profile
    console.log("Looking up recipient profile for ID:", recipientId);
    const recipient = await getRecipientData(recipientId);
    console.log("Found recipient:", recipient);

    // Step 2: Find admin for CC if needed
    let adminData = null;
    if (type === 'shift_coverage') {
      console.log("Looking for admin to CC for shift coverage request");
      adminData = await findAdminForMessage(currentUser, adminCc);
      console.log("Admin data for CC:", adminData);
    }

    // Step 3: Create communication entry
    console.log("Creating communication entry");
    const communicationData = await createCommunicationEntry({
      senderId: currentUser.id,
      recipientId,
      message,
      type,
      adminId: adminData?.id || adminCc || null
    });
    console.log("Communication created successfully:", communicationData.id);

    // Step 4: If it's a shift coverage request, add the shift details
    if (type === 'shift_coverage' && shiftDetails) {
      console.log(`Creating shift coverage request for communication ${communicationData.id}`);
      
      try {
        // CRITICAL FIX: Create shift coverage request with explicit IDs
        const fullShiftDetails = {
          original_employee_id: shiftDetails.original_employee_id || currentUser.id,
          covering_employee_id: shiftDetails.covering_employee_id || recipientId,
          shift_date: shiftDetails.shift_date,
          shift_start: shiftDetails.shift_start,
          shift_end: shiftDetails.shift_end,
          communication_id: communicationData.id // Ensure communication_id is properly passed
        };
        
        console.log("Creating shift coverage with details:", JSON.stringify(fullShiftDetails, null, 2));
        
        const shiftRequestData = await createShiftCoverageRequest(
          communicationData.id,
          fullShiftDetails
        );
        
        console.log("Shift coverage request created successfully:", shiftRequestData);
        
        // Step 5: Verify the request was created after a short delay
        setTimeout(async () => {
          console.log("Verifying shift coverage request was created");
          const verificationResult = await verifyShiftCoverageRequest(
            communicationData.id, 
            shiftDetails.shift_date,
            shiftDetails.original_employee_id || currentUser.id
          );
          
          console.log("Verification result:", verificationResult);
        }, 1000);
      } catch (shiftError: any) {
        console.error("Error creating shift coverage request:", shiftError);
        console.error("Error details:", shiftError.message, shiftError.code);
        // Even if shift request creation fails, we'll still return the communication
        // as it was created successfully
        toast.error("Created message but failed to create shift coverage request");
        
        // Don't throw here, as we want to continue with notification sending
      }
    }

    // Step 6: Send notification to recipient
    try {
      await sendMessageNotification(
        type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message',
        currentUser,
        recipient,
        {
          message,
          communicationId: communicationData.id,
          shiftDetails,
          adminCc: adminData ? {
            id: adminData.id,
            name: adminData.name,
            email: adminData.email
          } : null
        }
      );
    } catch (notifyError) {
      console.error("Error sending notification:", notifyError);
      // Don't throw here as the message was still saved
    }

    return communicationData;
  } catch (error: any) {
    console.error("Error in send message function:", error);
    throw error;
  }
}
