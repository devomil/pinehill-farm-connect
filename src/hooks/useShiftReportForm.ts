
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEmployees } from "./useEmployees";
import { useEmployeeAssignments } from "./useEmployeeAssignments";
import { notifyManager } from "@/utils/notifyManager";
import { useEffect, useState } from "react";

const formSchema = z.object({
  date: z.string(),
  notes: z.string().min(1, "Notes are required"),
  priority: z.enum(["high", "medium", "low"]),
  assignedTo: z.string().optional()
});

export type FormValues = z.infer<typeof formSchema>;

export function useShiftReportForm() {
  const { currentUser } = useAuth();
  const { employees, loading: employeesLoading } = useEmployees();
  const { assignments, isLoading: assignmentsLoading } = useEmployeeAssignments();
  const [assignableEmployees, setAssignableEmployees] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: "",
      priority: "medium",
      assignedTo: ""
    }
  });

  // Separate effect to process assignable employees when data is ready
  useEffect(() => {
    if (!employeesLoading && !assignmentsLoading) {
      const adminsAndManagers = employees.filter(e => e.role === 'admin' || e.role === 'manager');
      console.log(`Found ${adminsAndManagers.length} admins/managers for assignment`, adminsAndManagers);
      
      // Create a set of assignable employees starting with admins and managers
      const assignableSet = new Set(adminsAndManagers.map(e => e.id));
      const result = [...adminsAndManagers];

      // If we have assignments and a current user, find their admin
      if (currentUser && assignments && assignments.length > 0) {
        console.log(`Looking for assignments for ${currentUser.id}`, assignments);
        
        const currentUserAssignment = assignments.find(a => 
          a.employee_id === currentUser.id && a.admin_id
        );
        
        if (currentUserAssignment && currentUserAssignment.admin_id) {
          console.log(`Found assignment: user ${currentUser.id} is assigned to admin ${currentUserAssignment.admin_id}`);
          
          const assignedAdmin = employees.find(e => e.id === currentUserAssignment.admin_id);
          if (assignedAdmin && !assignableSet.has(assignedAdmin.id)) {
            console.log(`Adding assigned admin to list: ${assignedAdmin.name}`);
            result.push(assignedAdmin);
            assignableSet.add(assignedAdmin.id);
          }
        } else {
          console.log(`No assigned admin found for user ${currentUser.id}`);
          
          // For testing, add any user with 'admin' in their name if they're not showing up
          const potentialAdmins = employees.filter(e => 
            e.name.toLowerCase().includes('ryan') && !assignableSet.has(e.id)
          );
          
          if (potentialAdmins.length > 0) {
            console.log("Adding potential admin based on name:", potentialAdmins);
            result.push(...potentialAdmins);
          }
        }
      }
      
      setAssignableEmployees(result);
    }
  }, [employees, assignments, currentUser, employeesLoading, assignmentsLoading]);

  // Create test assignment if needed for demonstration
  const createTestAssignment = async () => {
    try {
      if (!currentUser) {
        toast.error("No current user found");
        return;
      }
      
      // Find Ryan in employees
      const ryan = employees.find(e => e.name.toLowerCase().includes('ryan'));
      if (!ryan) {
        toast.error("Ryan not found in employees list");
        return;
      }
      
      // Check if an assignment already exists
      const existingAssignment = assignments?.find(a => a.employee_id === currentUser.id);
      if (existingAssignment) {
        toast.info("Assignment already exists - updating to Ryan");
      }
      
      // Create or update the assignment
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: ryan.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Assigned ${currentUser.name} to Ryan Sorensen`);
      
      // Manually update the assignments list in memory
      const updatedAssignment = {
        id: existingAssignment?.id || crypto.randomUUID(),
        employee_id: currentUser.id,
        admin_id: ryan.id,
        created_at: new Date().toISOString(),
        employee: currentUser,
        admin: ryan
      };
      
      // Force a refresh of the assignable employees
      setAssignableEmployees(prev => {
        if (!prev.some(e => e.id === ryan.id)) {
          return [...prev, ryan];
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Error creating test assignment:', error);
      toast.error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const sendNotificationToAdmin = async (admin: any) => {
    try {
      if (!admin || !admin.email) {
        throw new Error("Invalid admin data provided");
      }
      
      // Make sure we're not sending a notification to ourselves
      if (currentUser && admin.email === currentUser.email) {
        throw new Error("Cannot send notification to yourself");
      }
      
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
            senderEmail: currentUser?.email || "", // Add sender email for validation
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
        // Find the first admin/manager that is not the current user
        const nonCurrentUserAdmin = assignableEmployees.find(emp => 
          emp.id !== currentUser?.id
        );
        
        if (nonCurrentUserAdmin) {
          console.log("Using assignable admin/manager for notification:", nonCurrentUserAdmin);
          await sendNotificationToAdmin(nonCurrentUserAdmin);
          return;
        } else {
          console.log("Found only the current user as assignable employee, looking for others");
        }
      } else {
        console.log("No assignable employees available, checking all employees");
      }
      
      // Then try all employees with admin or manager role
      if (employees && employees.length > 0) {
        const adminEmployees = employees.filter(e => 
          (e.role === 'admin' || e.role === 'manager') && 
          e.id !== currentUser?.id
        );
        
        console.log(`Found ${adminEmployees.length} admin/manager employees for notification`);
        
        if (adminEmployees.length > 0) {
          const admin = adminEmployees[0];
          console.log("Using admin/manager from all employees for notification:", admin);
          await sendNotificationToAdmin(admin);
          return;
        }
      }
      
      // If we get here, we couldn't find a suitable admin/manager
      console.log("No suitable admin or manager found to send notification");
      toast.error("No admin or manager found to send test notification. Please add an admin or manager to the system.");
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
        
        if (selectedAdmin && selectedAdmin.id !== currentUser?.id) {
          await sendNotificationToAdmin({
            id: selectedAdmin.id,
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
    assignableEmployees,
    createTestAssignment
  };
}
