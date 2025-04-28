
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "./useEmployees";
import { useEmployeeAssignments } from "./useEmployeeAssignments";
import { useShiftNotifications } from "./report/useShiftNotifications";
import { useShiftAssignments } from "./report/useShiftAssignments";
import { useShiftSubmission, ShiftFormValues } from "./report/useShiftSubmission";
import { toast } from "sonner";

const formSchema = z.object({
  date: z.string(),
  notes: z.string().min(1, "Notes are required"),
  priority: z.enum(["high", "medium", "low"]),
  assignedTo: z.string().optional()
});

export type FormValues = z.infer<typeof formSchema>;

export function useShiftReportForm() {
  const { currentUser } = useAuth();
  const { employees } = useEmployees();
  const { assignments } = useEmployeeAssignments();
  const { sendNotificationToAdmin } = useShiftNotifications();
  const { assignableEmployees, createTestAssignment } = useShiftAssignments(employees, assignments, currentUser);
  const { onSubmit: submitShiftReport } = useShiftSubmission(currentUser, employees);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: "",
      priority: "medium",
      assignedTo: ""
    }
  });

  const sendTestNotification = async () => {
    try {
      console.log("Starting test notification with assignable employees:", assignableEmployees.length);
      
      if (assignableEmployees && assignableEmployees.length > 0) {
        const nonCurrentUserAdmin = assignableEmployees.find(emp => 
          emp.id !== currentUser?.id
        );
        
        if (nonCurrentUserAdmin) {
          console.log("Using assignable admin/manager for notification:", nonCurrentUserAdmin);
          await sendNotificationToAdmin(nonCurrentUserAdmin, currentUser);
          return;
        }
      }
      
      if (employees && employees.length > 0) {
        const adminEmployees = employees.filter(e => 
          (e.role === 'admin' || e.role === 'manager') && 
          e.id !== currentUser?.id
        );
        
        if (adminEmployees.length > 0) {
          const admin = adminEmployees[0];
          console.log("Using admin/manager from all employees for notification:", admin);
          await sendNotificationToAdmin(admin, currentUser);
          return;
        }
      }
      
      console.log("No suitable admin or manager found to send notification");
      toast.error("No admin or manager found to send test notification. Please add an admin or manager to the system.");
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error(`Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    // Ensure data matches ShiftFormValues shape
    const formData: ShiftFormValues = {
      date: data.date,
      notes: data.notes,
      priority: data.priority,
      assignedTo: data.assignedTo
    };
    
    submitShiftReport(formData, () => {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        notes: "",
        priority: "medium",
        assignedTo: ""
      });
    });
  });

  return {
    form,
    onSubmit: handleSubmit,
    sendTestNotification,
    assignableEmployees,
    createTestAssignment
  };
}
