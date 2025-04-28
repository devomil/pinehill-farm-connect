
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
      const { error } = await supabase
        .from('shift_reports')
        .insert({
          user_id: currentUser?.id,
          date: data.date,
          notes: data.notes,
          priority: data.priority,
          assigned_to: data.assignedTo || null
        });

      if (error) throw error;

      if (data.assignedTo) {
        const selectedAdmin = employees.find(e => e.id === data.assignedTo);
        
        if (selectedAdmin && selectedAdmin.id !== currentUser?.id) {
          // Use the notifyManager utility directly for actual report submissions
          // This ensures the assignedTo information is included
          await notifyManager(
            "shift_report", 
            {
              id: currentUser?.id || "unknown",
              name: currentUser?.name || "Unknown User",
              email: currentUser?.email || "unknown"
            },
            {
              date: data.date,
              notes: data.notes,
              priority: data.priority
            },
            selectedAdmin
          );
        }
      }

      toast.success("Shift report submitted successfully");
      resetForm();
    } catch (error) {
      console.error('Error submitting shift report:', error);
      toast.error("Failed to submit shift report");
    }
  };

  return { onSubmit };
}
