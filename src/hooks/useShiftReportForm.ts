
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEmployees } from "./useEmployees";
import { useEmployeeAssignments } from "./useEmployeeAssignments";
import { notifyManager } from "@/utils/notifyManager";

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: "",
      priority: "medium",
      assignedTo: ""
    }
  });

  const getAssignableEmployees = () => {
    if (!employees || employees.length === 0) {
      console.log("No employees available for assignment");
      return [];
    }
    
    // Always include admins and managers as assignable
    const adminsAndManagers = employees.filter(e => e.role === 'admin' || e.role === 'manager');
    console.log(`Found ${adminsAndManagers.length} admins/managers for assignment`, adminsAndManagers);
    
    // If we have assignments and a current user, find their admin
    if (currentUser && assignments && assignments.length > 0) {
      const currentUserAssignment = assignments.find(a => a.employee_id === currentUser.id);
      
      if (currentUserAssignment && currentUserAssignment.admin_id) {
        const assignedAdmin = employees.find(e => e.id === currentUserAssignment.admin_id);
        if (assignedAdmin) {
          // Make sure the assigned admin is in the list and not duplicated
          const combinedAssignables = [...adminsAndManagers];
          if (!combinedAssignables.some(e => e.id === assignedAdmin.id)) {
            combinedAssignables.push(assignedAdmin);
          }
          console.log(`User has assigned admin: ${assignedAdmin.name}`, combinedAssignables);
          return combinedAssignables;
        }
      }
    }
    
    // Return admins and managers if no specific assignment
    return adminsAndManagers;
  };

  const assignableEmployees = getAssignableEmployees();

  const sendNotificationToAdmin = async (admin: any) => {
    try {
      console.log("Sending notification to admin:", admin);
      
      // First try using the notifyManager utility
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
      
      // Fallback to direct function invocation
      const response = await supabase.functions.invoke('send-admin-notification', {
        body: {
          adminEmail: admin.email,
          adminName: admin.name,
          type: "report",
          priority: "high",
          employeeName: currentUser?.name || "Test User",
          details: {
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

  const sendTestNotification = async () => {
    try {
      console.log("Starting test notification with assignable employees:", assignableEmployees.length);
      
      // First try to find an admin from assignable employees
      if (assignableEmployees && assignableEmployees.length > 0) {
        const admin = assignableEmployees[0];
        console.log("Using assignable employee for notification:", admin);
        await sendNotificationToAdmin(admin);
        return;
      } else {
        console.log("No assignable employees available, checking all employees");
      }
      
      // Then try all employees with admin or manager role
      if (employees && employees.length > 0) {
        const adminEmployees = employees.filter(e => e.role === 'admin' || e.role === 'manager');
        console.log(`Found ${adminEmployees.length} admin/manager employees for notification`);
        
        if (adminEmployees.length > 0) {
          const admin = adminEmployees[0];
          console.log("Using admin/manager from all employees for notification:", admin);
          await sendNotificationToAdmin(admin);
          return;
        }
      }
      
      // If we get here, try with the first employee as a last resort
      if (employees && employees.length > 0) {
        const firstEmployee = employees[0];
        console.log("No admin found. Trying first available employee as fallback:", firstEmployee);
        await sendNotificationToAdmin(firstEmployee);
        return;
      }
      
      console.log("No admin or employee found to send notification");
      toast.error("No admin found to send test notification. Please add an admin or manager to the system.");
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error(`Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const onSubmit = async (data: FormValues) => {
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

      if (data.assignedTo && (data.priority === "high" || data.priority === "medium")) {
        const selectedAdmin = employees.find(e => e.id === data.assignedTo);
        
        if (selectedAdmin) {
          await sendNotificationToAdmin({
            email: selectedAdmin.email,
            name: selectedAdmin.name
          });
        }
      }

      toast.success("Shift report submitted successfully");
      form.reset({
        date: new Date().toISOString().split('T')[0],
        notes: "",
        priority: "medium",
        assignedTo: ""
      });
    } catch (error) {
      console.error('Error submitting shift report:', error);
      toast.error("Failed to submit shift report");
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    sendTestNotification,
    assignableEmployees
  };
}
