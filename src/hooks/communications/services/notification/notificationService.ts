
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
  
  // Add a little debounce - prevents multiple rapid notifications within 1 second
  const notificationKey = `${currentUser.id}-${recipient.id}-${type}`;
  const lastSentTime = window.sessionStorage.getItem(notificationKey);
  const now = Date.now();
  
  if (lastSentTime && (now - parseInt(lastSentTime)) < 1000) {
    console.log("Skipping duplicate notification within 1 second");
    return;
  }
  
  try {
    // Determine the appropriate notification type
    const notificationType = type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message';
    
    // Prevent duplicate notifications by adding a timestamp
    const notificationData = {
      message,
      communicationId,
      timestamp: now,
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
    
    // Store timestamp of this notification
    window.sessionStorage.setItem(notificationKey, now.toString());
    
    console.log(`Message notification (${notificationType}) sent successfully`);
    
    // If we have an admin to CC and this is a shift coverage request,
    // send them a notification as well - with a small delay to avoid race conditions
    if (adminData && type === 'shift_coverage') {
      setTimeout(async () => {
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
      }, 500);
    }
    
  } catch (notifyError) {
    console.error("Error sending notification:", notifyError);
    // Don't throw here as the message was still saved
  }
}
