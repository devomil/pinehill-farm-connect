
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
    console.error("User not logged in when attempting to send message");
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
    if (!recipient) {
      throw new Error("Could not find recipient profile");
    }
    
    // Step 2: Find admin for CC
    // For shift coverage requests, always use Jackie as the admin
    let adminData;
    if (type === 'shift_coverage') {
      // Force Jackie as admin for all shift coverage requests
      adminData = {
        id: "admin-jackie", // This is just a placeholder, actual ID would come from the database
        name: "Jackie Phillips",
        email: "jackie@pinehillfarm.co"
      };
      console.log("Using Jackie as admin for shift coverage request");
    } else {
      // For other message types, use the provided adminCc or find one
      adminData = await findAdminForCommunication(currentUser, type, adminCc);
    }
    
    // Step 3: Create communication entry
    const communicationData = await createCommunicationRecord({
      senderId: currentUser.id,
      recipientId,
      message,
      type,
      adminId: adminData?.id || adminCc || null
    });
    
    if (!communicationData || !communicationData.id) {
      throw new Error("Failed to create communication record");
    }
    
    // Step 4: Handle shift coverage request if applicable
    if (type === 'shift_coverage' && shiftDetails) {
      try {
        await handleShiftCoverageDetails(communicationData.id, shiftDetails, currentUser.id, recipientId);
      } catch (shiftError) {
        console.error("Error handling shift coverage details:", shiftError);
        // Continue with the message flow even if shift details handling fails
        // But record the error for debugging
      }
    }

    // Step 5: Send notifications
    try {
      await sendNotifications({
        type,
        currentUser,
        recipient,
        message,
        communicationId: communicationData.id,
        shiftDetails,
        adminData
      });
    } catch (notifyError) {
      console.error("Error sending notifications:", notifyError);
      // Don't fail the whole operation if just notifications fail
    }

    return communicationData;
  } catch (error: any) {
    console.error("Error in send message function:", error);
    throw error;
  }
}
