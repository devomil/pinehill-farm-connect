
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEmployees } from "./useEmployees";
import { useEmployeeAssignments } from "./useEmployeeAssignments";

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
      return [];
    }
    
    if (!currentUser || !assignments) {
      return employees.filter(e => e.role === 'admin' || e.role === 'manager');
    }
    
    const currentUserAssignment = assignments?.find(a => a.employee_id === currentUser?.id);
    
    if (currentUserAssignment) {
      const assignedAdmin = employees.find(e => e.id === currentUserAssignment.admin_id);
      if (assignedAdmin) {
        return [assignedAdmin];
      }
    }
    
    return employees.filter(e => e.role === 'admin' || e.role === 'manager');
  };

  const assignableEmployees = getAssignableEmployees();

  const sendNotificationToAdmin = async (admin: any) => {
    try {
      console.log("Sending notification to admin:", admin);
      await supabase.functions.invoke('send-admin-notification', {
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

      toast.success("Test notification email sent successfully");
    } catch (error) {
      console.error('Error in sendNotificationToAdmin:', error);
      throw error;
    }
  };

  const sendTestNotification = async () => {
    try {
      if (assignableEmployees.length > 0) {
        const admin = assignableEmployees[0];
        console.log("Using assignable employee for notification:", admin);
        await sendNotificationToAdmin(admin);
        return;
      }
      
      const adminEmployees = employees.filter(e => e.role === 'admin' || e.role === 'manager');
      
      if (adminEmployees.length > 0) {
        const admin = adminEmployees[0];
        console.log("Using admin/manager from all employees for notification:", admin);
        await sendNotificationToAdmin(admin);
        return;
      }
      
      console.log("No admin found to send notification");
      toast.error("No admin found to send test notification");
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error("Failed to send test notification");
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
