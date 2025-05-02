
import { User } from "@/types";
import { sendMessageNotification } from "../../utils/notificationUtils";

/**
 * Service for sending notifications about messages
 */
export async function sendNotifications(params: {
  type: string;
  currentUser: User;
  recipient: any;
  message: string;
  communicationId: string;
  shiftDetails?: any;
  adminData?: any;
}) {
  const { type, currentUser, recipient, message, communicationId, shiftDetails, adminData } = params;
  
  try {
    await sendMessageNotification(
      type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message',
      currentUser,
      recipient,
      {
        message,
        communicationId,
        shiftDetails,
        adminCc: adminData ? {
          id: adminData.id,
          name: adminData.name,
          email: adminData.email
        } : null
      }
    );
    
    console.log("Message notification sent successfully");
  } catch (notifyError) {
    console.error("Error sending notification:", notifyError);
    // Don't throw here as the message was still saved
  }
}
