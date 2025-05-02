
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
  
  // Enhanced logging for shift coverage requests
  if (type === 'shift_coverage' && shiftDetails) {
    console.log("Shift coverage request details:", JSON.stringify(shiftDetails, null, 2));
    
    // Validate shift details
    if (!validateShiftDetails(shiftDetails)) {
      throw new Error("Missing required shift details");
    }
  }
  
  try {
    // Step 1: Find recipient profile
    const recipient = await getRecipientData(recipientId);

    // Step 2: Find admin for CC if needed
    let adminData = null;
    if (type === 'shift_coverage') {
      adminData = await findAdminForMessage(currentUser, adminCc);
    }

    // Step 3: Create communication entry
    const communicationData = await createCommunicationEntry({
      senderId: currentUser.id,
      recipientId,
      message,
      type,
      adminId: adminData?.id || adminCc || null
    });

    // Step 4: If it's a shift coverage request, add the shift details
    if (type === 'shift_coverage' && shiftDetails) {
      console.log(`Creating shift coverage request for communication ${communicationData.id}`);
      
      try {
        const shiftRequestData = await createShiftCoverageRequest(
          communicationData.id,
          {
            original_employee_id: shiftDetails.original_employee_id || currentUser.id,
            covering_employee_id: shiftDetails.covering_employee_id || recipientId,
            shift_date: shiftDetails.shift_date,
            shift_start: shiftDetails.shift_start,
            shift_end: shiftDetails.shift_end
          }
        );
        
        // Step 5: Verify the request was created after a short delay
        setTimeout(async () => {
          const verificationResult = await verifyShiftCoverageRequest(
            communicationData.id, 
            shiftDetails.shift_date,
            shiftDetails.original_employee_id || currentUser.id
          );
        }, 1000);
      } catch (shiftError) {
        console.error("Error creating shift coverage request:", shiftError);
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
