
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAssignmentManagement } from "@/hooks/report/useAssignmentManagement";
import { useShiftNotifications } from "@/hooks/report/useShiftNotifications";
import { FormValues } from "@/hooks/report/types/reportFormTypes";
import { submitShiftReport } from "@/hooks/report/services/shiftReportService";

export { type FormValues } from "@/hooks/report/types/reportFormTypes";

export function useShiftReportForm() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { unfilteredEmployees: assignableEmployees } = useEmployeeDirectory();
  const { createTestAssignment } = useAssignmentManagement(assignableEmployees, currentUser);
  const { sendNotificationToAdmin } = useShiftNotifications();
  
  const form = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
      priority: 'medium',
      assignedTo: undefined
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast.error("You must be logged in to submit reports");
      return;
    }

    try {
      setIsSubmitting(true);

      // Use the extracted shiftReportService to submit the report
      const result = await submitShiftReport({
        user_id: currentUser.id,
        date: values.date,
        notes: values.notes,
        priority: values.priority,
        assignedTo: values.assignedTo,
        // Add required fields from ShiftReportInput type
        shift_start: "",
        shift_end: "",
        total_hours: 0,
        tasks_completed: "",
        challenges_faced: "",
        lessons_learned: "",
        shift_summary: ""
      }, currentUser);
      
      if (result.error) throw result.error;

      toast.success("Report submitted successfully");
      form.reset({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        priority: 'medium',
        assignedTo: undefined
      });
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to send a test notification
  const sendTestNotification = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to send test notifications");
      return;
    }

    try {
      // Get the assigned admin from the form
      const assignedToId = form.getValues("assignedTo");
      
      if (!assignedToId) {
        toast.warning("Please select an employee to send the test notification to");
        return;
      }
      
      // Find the selected employee in the directory
      const selectedEmployee = assignableEmployees.find(emp => emp.id === assignedToId);
      
      if (!selectedEmployee) {
        toast.error("Selected employee not found");
        return;
      }
      
      // Send the test notification using our notification utility
      await sendNotificationToAdmin(selectedEmployee, currentUser);
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      toast.error(`Failed to send test notification: ${error.message}`);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    sendTestNotification,
    createTestAssignment,
  };
}
