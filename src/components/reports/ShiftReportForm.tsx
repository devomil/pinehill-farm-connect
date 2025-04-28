
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";

const formSchema = z.object({
  date: z.string(),
  notes: z.string().min(1, "Notes are required"),
  priority: z.enum(["high", "medium", "low"]),
  assignedTo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function ShiftReportForm() {
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
    const currentUserAssignment = assignments?.find(a => a.employee_id === currentUser?.id);
    
    if (currentUserAssignment?.admin) {
      const assignedAdmin = employees.find(e => e.id === currentUserAssignment.admin_id);
      return assignedAdmin ? [assignedAdmin] : [];
    } else {
      return employees.filter(e => e.role === 'admin' || e.role === 'manager');
    }
  };

  const assignableEmployees = getAssignableEmployees();

  const sendTestNotification = async () => {
    try {
      // Find managers or admins from our filtered list
      const adminEmployees = employees.filter(e => e.role === 'admin' || e.role === 'manager');
      
      if (adminEmployees.length === 0) {
        // If no admins in employees list, try to use an assignable employee
        if (assignableEmployees.length > 0) {
          const admin = assignableEmployees[0];
          await sendNotificationToAdmin(admin);
          return;
        }
        
        toast.error("No admin found to send test notification");
        return;
      }

      const admin = adminEmployees[0];
      await sendNotificationToAdmin(admin);
      
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error("Failed to send test notification");
    }
  };

  const sendNotificationToAdmin = async (admin: any) => {
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
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', data.assignedTo)
          .single();

        if (adminProfile) {
          await supabase.functions.invoke('send-admin-notification', {
            body: {
              adminEmail: adminProfile.email,
              adminName: adminProfile.name,
              type: "report",
              priority: data.priority,
              employeeName: currentUser?.name || "An employee",
              details: {
                date: data.date,
                notes: data.notes,
                priority: data.priority
              }
            },
          });
        }
      }

      toast.success("Shift report submitted successfully");
      form.reset();
    } catch (error) {
      console.error('Error submitting shift report:', error);
      toast.error("Failed to submit shift report");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your shift notes here..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin/manager to assign (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assignableEmployees.length > 0 ? (
                    assignableEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-admins" disabled>No admins/managers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="button" 
          variant="secondary" 
          onClick={sendTestNotification}
          className="mt-4"
        >
          Send Test Notification
        </Button>

        <Button type="submit">Submit Report</Button>
      </form>
    </Form>
  );
}
