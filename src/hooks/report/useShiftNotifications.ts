
import { supabase } from "@/integrations/supabase/client";
import { notifyManager } from "@/utils/notifyManager";
import { toast } from "sonner";
import { User } from "@/types";

export function useShiftNotifications() {
  const sendNotificationToAdmin = async (admin: any, currentUser: User | null) => {
    try {
      if (!admin || !admin.email) {
        throw new Error("Invalid admin data provided");
      }
      
      // Ensure email has domain
      let adminEmail = admin.email;
      if (admin.email && !admin.email.includes('@')) {
        adminEmail = `${admin.email}@pinehillfarm.co`;
        console.log(`Formatting email address: ${admin.email} -> ${adminEmail}`);
      }
      
      // Make sure the admin has a valid email format
      if (!adminEmail.includes('@')) {
        console.error(`Invalid email format for admin: ${adminEmail}`);
        toast.error(`Cannot send notification: Invalid email format for ${admin.name}`);
        return;
      }
      
      // Prevent self-notifications
      if (currentUser && (adminEmail === currentUser.email || admin.id === currentUser.id)) {
        toast.error("Cannot send notification to yourself");
        return;
      }
      
      console.log("Sending notification to admin:", { 
        id: admin.id,
        name: admin.name, 
        email: adminEmail 
      });
      
      // Use the notifyManager to send a test notification using the shift_report action type
      const result = await notifyManager(
        "shift_report", 
        { 
          id: currentUser?.id || "unknown", 
          name: currentUser?.name || "Unknown User", 
          email: currentUser?.email || "unknown" 
        }, 
        {
          date: new Date().toISOString().split('T')[0],
          notes: "This is a test notification",
          priority: "high"
        },
        { 
          id: admin.id, 
          name: admin.name, 
          email: adminEmail 
        }
      );
      
      if (result.success) {
        console.log("Notification sent successfully:", result);
        toast.success(`Test notification sent successfully to ${admin.name} (${adminEmail})`);
        return true;
      } else {
        console.error("Error sending notification:", result.error);
        toast.error(`Failed to send notification: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error in sendNotificationToAdmin:', error);
      toast.error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  return {
    sendNotificationToAdmin,
  };
}
