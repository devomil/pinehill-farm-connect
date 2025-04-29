
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAssignmentManagement } from "@/hooks/report/useAssignmentManagement";

export interface FormValues {
  date: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export function useShiftReportForm() {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { unfilteredEmployees: assignableEmployees } = useEmployeeDirectory();
  const { createTestAssignment } = useAssignmentManagement(assignableEmployees, currentUser);
  
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

      const { data, error } = await supabase
        .from('shift_reports')
        .insert({
          user_id: currentUser.id,
          date: values.date,
          notes: values.notes,
          priority: values.priority,
          admin_id: values.assignedTo
        })
        .select()
        .single();

      if (error) throw error;

      // If there is an assigned employee, send them a notification
      if (values.assignedTo && data) {
        try {
          const notifyResult = await supabase.functions.invoke('notify-manager', {
            body: {
              action: 'shift_report_assigned',
              sender: {
                id: currentUser.id,
                name: currentUser.name || currentUser.email?.split('@')[0] || 'Unknown',
                email: currentUser.email || 'unknown'
              },
              data: {
                reportId: data.id,
                date: values.date,
                notes: values.notes.substring(0, 50) + (values.notes.length > 50 ? '...' : ''),
                priority: values.priority
              },
              receiver: {
                id: values.assignedTo
              }
            }
          });
          
          if (!notifyResult.error) {
            console.log("Notification sent successfully");
          } else {
            console.error("Error sending notification:", notifyResult.error);
          }
        } catch (notifyError) {
          console.error("Failed to send notification:", notifyError);
        }
      }

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
      // Find a recipient to send the test to
      const recipient = assignableEmployees.find(emp => emp.id !== currentUser.id) || currentUser;

      const result = await supabase.functions.invoke('notify-manager', {
        body: {
          action: 'test_notification',
          sender: {
            id: currentUser.id,
            name: currentUser.name || currentUser.email?.split('@')[0] || 'Unknown User',
            email: currentUser.email || 'unknown'
          },
          data: {
            message: 'This is a test notification',
            timestamp: new Date().toISOString()
          },
          receiver: {
            id: recipient.id,
            name: recipient.name,
            email: recipient.email
          }
        }
      });

      if (result.error) {
        throw new Error(`Notification error: ${result.error.message}`);
      }

      toast.success(`Test notification sent to ${recipient.name}`);
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
