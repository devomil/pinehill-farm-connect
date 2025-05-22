
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
    // Determine the appropriate notification type
    const notificationType = type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message';
    
    // Prevent duplicate notifications by adding a timestamp
    const notificationData = {
      message,
      communicationId,
      timestamp: Date.now(),
      shiftDetails: shiftDetails || null,
      adminCc: adminData ? {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email
      } : null
    };
    
    await sendMessageNotification(
      notificationType,
      currentUser,
      recipient,
      notificationData
    );
    
    console.log(`Message notification (${notificationType}) sent successfully`);
    
    // If we have an admin to CC and this is a shift coverage request,
    // send them a notification as well
    if (adminData && type === 'shift_coverage') {
      console.log(`Sending CC notification to admin: ${adminData.name}`);
      
      // Send a slightly different notification to the admin
      await sendMessageNotification(
        'shift_coverage_admin_cc',
        currentUser,
        adminData,
        {
          ...notificationData,
          isAdminCc: true
        }
      );
    }
    
  } catch (notifyError) {
    console.error("Error sending notification:", notifyError);
    // Don't throw here as the message was still saved
  }
}
