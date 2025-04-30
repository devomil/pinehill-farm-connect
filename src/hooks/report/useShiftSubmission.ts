
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface ShiftReport {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  total_hours: number;
  tasks_completed: string;
  challenges_faced: string;
  lessons_learned: string;
  shift_summary: string;
  priority: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
  notes: string;
}

type ShiftReportInput = Omit<ShiftReport, 'id' | 'created_at' | 'submitted_by' | 'submitted_at' | 'status'>;

export const useShiftSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const submitShiftReport = async (reportData: ShiftReportInput) => {
    setIsSubmitting(true);
    try {
      if (!currentUser) {
        throw new Error("User not authenticated.");
      }

      const { data: shiftReport, error: shiftReportError } = await supabase
        .from('shift_reports')
        .insert([
          {
            ...reportData,
            user_id: currentUser.id,
            submitted_by: currentUser.name || currentUser.email,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          }
        ])
        .select()
        .single();

      if (shiftReportError) {
        console.error("Error submitting shift report:", shiftReportError);
        throw new Error(`Failed to submit shift report: ${shiftReportError.message}`);
      }

      // Fetch admins to send notifications
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin');

      if (adminsError) {
        console.error("Error fetching admins:", adminsError);
        throw new Error(`Failed to fetch admins: ${adminsError.message}`);
      }

      if (!admins || admins.length === 0) {
        console.warn("No admins found to notify.");
      } else {
        // Send notifications to admins
        await sendNotifications(admins as User[], shiftReport.id, reportData.priority);
      }

      toast.success('Shift report submitted successfully!');
      return shiftReport;

    } catch (error: any) {
      console.error("Error in submitShiftReport:", error.message);
      toast.error(`Failed to submit shift report: ${error.message}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendNotifications = async (admins: User[], shiftReportId: string, priority: string) => {
    try {
      // Prepare notification content
      const notificationTitle = `New Shift Report Submitted - Priority: ${priority}`;
      const notificationMessage = `A new shift report has been submitted by ${currentUser?.name || 'Employee'}`;

      // Create notifications for each admin
      for (const admin of admins) {
        // Make sure user has required fields by providing defaults if needed
        const adminUser = {
          id: admin.id,
          name: admin.name || 'Admin',
          email: admin.email || ''
        };

        // Send admin notification
        const { error: notifyError } = await supabase.functions.invoke('notify-manager', {
          body: { 
            admin: adminUser, 
            reportId: shiftReportId, 
            priority, 
            reportUserName: currentUser?.name || 'Employee'
          }
        });

        if (notifyError) {
          console.error('Error sending notification:', notifyError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications.');
      return false;
    }
  };

  // Use properly typed mutation
  const mutation = useMutation({
    mutationFn: submitShiftReport,
    onSuccess: () => {
      // Handle success if needed
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    }
  });

  return {
    submitShiftReport,
    isSubmitting,
    ...mutation,
  };
};
