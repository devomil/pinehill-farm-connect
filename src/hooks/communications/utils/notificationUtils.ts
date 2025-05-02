
import { notifyManager } from "@/utils/notifyManager";
import { User } from "@/types";

interface RecipientData {
  id: string;
  name: string;
  email: string;
}

interface AdminCCData {
  id: string;
  name: string;
  email: string;
}

/**
 * Sends notifications for message events
 */
export async function sendMessageNotification(
  actionType: 'new_message' | 'shift_coverage_request',
  currentUser: User,
  recipientData: RecipientData,
  messageDetails: {
    message: string;
    communicationId: string;
    shiftDetails?: any;
    adminCc?: AdminCCData | null;
  }
) {
  try {
    console.log(`Sending notification to ${recipientData.name} (${recipientData.email}) with ID: ${recipientData.id}`);
    
    const notifyResult = await notifyManager(
      actionType,
      {
        id: currentUser.id || "unknown",
        name: currentUser.name || "Unknown User",
        email: currentUser.email || "unknown"
      },
      {
        message: messageDetails.message,
        communicationId: messageDetails.communicationId,
        adminCc: messageDetails.adminCc,
        ...(messageDetails.shiftDetails || {})
      },
      {
        id: recipientData.id,
        name: recipientData.name,
        email: recipientData.email
      }
    );

    if (!notifyResult.success) {
      console.warn("Notification sending failed, but message was saved:", notifyResult.error);
    }
    
    return notifyResult;
  } catch (notifyError) {
    console.error("Error sending notification:", notifyError);
    // Return error info but don't throw since message was still saved
    return { success: false, error: notifyError };
  }
}

/**
 * Validates shift coverage request details
 */
export function validateShiftDetails(shiftDetails: any): boolean {
  if (!shiftDetails.shift_date || !shiftDetails.shift_start || !shiftDetails.shift_end) {
    console.error("Missing required shift details:", shiftDetails);
    return false;
  }
  return true;
}
