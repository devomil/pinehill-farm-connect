
/**
 * Main service for handling the entire message sending flow
 * This file now serves as a facade that coordinates the various specialized services
 */
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/communicationTypes";
import { toast } from "sonner";
import { findRecipientProfile } from "./recipient/recipientLookupService";
import { findAdminForCommunication } from "./admin/adminLookupService";
import { createCommunicationRecord } from "./communication/communicationCreationService";
import { handleShiftCoverageDetails } from "./shift/shiftCoverageService";
import { sendNotifications } from "./notification/notificationService";

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
  
  try {
    // Step 1: Find recipient profile
    const recipient = await findRecipientProfile(recipientId);
    
    // Step 2: Find admin for CC if needed
    const adminData = await findAdminForCommunication(currentUser, type, adminCc);
    
    // Step 3: Create communication entry
    const communicationData = await createCommunicationRecord({
      senderId: currentUser.id,
      recipientId,
      message,
      type,
      adminId: adminData?.id || adminCc || null
    });
    
    // Step 4: Handle shift coverage request if applicable
    if (type === 'shift_coverage' && shiftDetails) {
      await handleShiftCoverageDetails(communicationData.id, shiftDetails, currentUser.id, recipientId);
    }

    // Step 5: Send notifications
    await sendNotifications({
      type,
      currentUser,
      recipient,
      message,
      communicationId: communicationData.id,
      shiftDetails,
      adminData
    });

    return communicationData;
  } catch (error: any) {
    console.error("Error in send message function:", error);
    throw error;
  }
}
