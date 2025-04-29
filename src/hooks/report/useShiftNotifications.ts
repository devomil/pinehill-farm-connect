
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
      
      try {
        // First, attempt to use the notifyManager utility with detailed logging
        console.log(`Sending test notification to: ${admin.name} (${adminEmail}) with ID: ${admin.id}`);
        
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
          },
          { 
            id: admin.id, 
            name: admin.name, 
            email: adminEmail 
          } // Pass the assigned admin with formatted email
        );
        
        if (result.success) {
          console.log("Notification sent via notifyManager:", result);
          toast.success(`Test notification sent successfully to ${admin.name} (${adminEmail})`);
          return;
        } else {
          if (result.invalidEmail) {
            toast.error(`Failed to send notification: Invalid email address for ${admin.name}`);
            return;
          }
          
          if (result.selfNotification) {
            toast.error("Cannot send notification to yourself");
            return;
          }
          
          console.warn("notifyManager failed, falling back to direct function invoke:", result.error);
        }
      } catch (notifyError) {
        console.error("Error using notifyManager, falling back to direct function:", notifyError);
      }
      
      // Fallback mechanism - direct function invocation with detailed logging
      console.log(`Falling back to direct function invocation for: ${admin.name} (${adminEmail}) with ID: ${admin.id}`);
      
      const response = await supabase.functions.invoke('send-admin-notification', {
        body: {
          adminEmail: adminEmail,
          adminName: admin.name,
          adminId: admin.id, // Include the admin ID to help with tracking
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
      toast.success(`Test notification email sent successfully to ${admin.name} (${adminEmail})`);
    } catch (error) {
      console.error('Error in sendNotificationToAdmin:', error);
      toast.error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    sendNotificationToAdmin,
  };
}
