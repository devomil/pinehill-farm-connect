
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: "",
      priority: "medium",
      assignedTo: ""
    }
  });

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

      // If the report is high or medium priority and has an assigned admin, send notification
      if (data.assignedTo && (data.priority === "high" || data.priority === "medium")) {
        // Get admin's profile
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', data.assignedTo)
          .single();

        if (adminProfile) {
          // Send notification
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
              <FormLabel>Assign To Employee</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit Report</Button>
      </form>
    </Form>
  );
}
