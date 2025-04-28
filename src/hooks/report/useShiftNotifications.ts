
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
      
      if (currentUser && admin.email === currentUser.email) {
        throw new Error("Cannot send notification to yourself");
      }
      
      console.log("Sending notification to admin:", admin);
      
      try {
        const result = await notifyManager("shift_report", 
          { 
            id: currentUser?.id || "unknown", 
            name: currentUser?.name || "Unknown User", 
            email: currentUser?.email || "unknown" 
          }, 
          {
            date: new Date().toISOString().split('T')[0],
            notes: "This is a test notification",
            priority: "high"
          }
        );
        
        if (result.success) {
          console.log("Notification sent via notifyManager:", result);
          toast.success("Test notification sent successfully via manager notification system");
          return;
        } else {
          console.warn("notifyManager failed, falling back to direct function invoke:", result.error);
        }
      } catch (notifyError) {
        console.error("Error using notifyManager, falling back to direct function:", notifyError);
      }
      
      const response = await supabase.functions.invoke('send-admin-notification', {
        body: {
          adminEmail: admin.email,
          adminName: admin.name,
          type: "report",
          priority: "high",
          employeeName: currentUser?.name || "Test User",
          details: {
            senderEmail: currentUser?.email || "",
            date: new Date().toISOString().split('T')[0],
            notes: "This is a test notification",
            priority: "high"
          }
        },
      });

      if (response.error) {
        throw new Error(`Function error: ${response.error.message}`);
      }

      console.log("Email function response:", response.data);
      toast.success("Test notification email sent successfully");
    } catch (error) {
      console.error('Error in sendNotificationToAdmin:', error);
      toast.error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    sendNotificationToAdmin,
  };
}
