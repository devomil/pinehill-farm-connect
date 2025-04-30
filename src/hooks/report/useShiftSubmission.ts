
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";
import { useShiftNotifications } from "./useShiftNotifications";
import { notifyManager } from "@/utils/notifyManager";

export type ShiftFormValues = {
  date: string;
  notes: string;
  priority: "high" | "medium" | "low";
  assignedTo?: string;
};

export function useShiftSubmission(currentUser: User | null, employees: User[]) {
  const { sendNotificationToAdmin } = useShiftNotifications();

  const onSubmit = async (data: ShiftFormValues, resetForm: () => void) => {
    try {
      // First, validate the report data
      if (!data.notes || !data.date || !data.priority) {
        throw new Error("Missing required fields in report");
      }
      
      // Create the shift report
      const { data: reportData, error } = await supabase
        .from('shift_reports')
        .insert({
          user_id: currentUser?.id,
          date: data.date,
          notes: data.notes,
          priority: data.priority,
          assigned_to: data.assignedTo || null
        })
        .select();

      if (error) throw error;

      // If the report is assigned to someone, send a notification
      if (data.assignedTo) {
        // Find the assigned employee with complete profile data
        const selectedEmployee = employees.find(e => e.id === data.assignedTo);
        
        if (selectedEmployee && selectedEmployee.id !== currentUser?.id) {
          console.log(`Sending notification for assigned report to: ${selectedEmployee.name} (${selectedEmployee.email})`);
          
          // Validate the assigned user's email
          if (!selectedEmployee.email || !selectedEmployee.email.includes('@')) {
            console.error(`Invalid email for assigned user: ${selectedEmployee.email}`);
            toast.error(`Report submitted, but notification could not be sent due to invalid email address for ${selectedEmployee.name || 'user'}`);
          } else if (selectedEmployee.email === currentUser?.email) {
            console.error("Cannot send notification to yourself");
            toast.error("Report submitted, but notification was not sent as you cannot notify yourself");
          } else {
            // Use the notifyManager utility directly for actual report submissions
            // This ensures the assignedTo information is included
            const notifyResult = await notifyManager(
              "shift_report", 
              {
                id: currentUser?.id || "unknown",
                name: currentUser?.name || "Unknown User",
                email: currentUser?.email || "unknown"
              },
              {
                date: data.date,
                notes: data.notes,
                priority: data.priority,
                reportId: reportData?.[0]?.id
              },
              {
                id: selectedEmployee.id,
                name: selectedEmployee.name || "Unknown User",
                email: selectedEmployee.email
              }
            );
            
            if (!notifyResult.success) {
              console.error("Failed to send notification:", notifyResult.error);
              
              if (notifyResult.invalidEmail) {
                toast.error(`Report submitted, but notification could not be sent due to invalid email address for ${selectedEmployee.name || 'user'}`);
              } else if (notifyResult.selfNotification) {
                toast.error("Report submitted, but notification was not sent as you cannot notify yourself");
              } else {
                toast.error("Report was submitted but notification failed to send");
              }
            } else {
              toast.success(`Report submitted and notification sent successfully to ${selectedEmployee.name || 'user'}`);
            }
          }
        } else if (selectedEmployee && selectedEmployee.id === currentUser?.id) {
          toast.success("Report submitted successfully (no notification sent as you assigned to yourself)");
        } else {
          toast.success("Report submitted successfully");
        }
      } else {
        toast.success("Shift report submitted successfully");
      }
      
      resetForm();
    } catch (error) {
      console.error('Error submitting shift report:', error);
      toast.error("Failed to submit shift report");
    }
  };

  return { onSubmit };
}
