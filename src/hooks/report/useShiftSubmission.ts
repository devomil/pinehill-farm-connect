
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define the actual shape of what comes back from the database
interface DBShiftReport {
  id: string;
  created_at: string;
  user_id: string;
  date: string;
  admin_id: string | null;
  notes: string;
  priority: string;
  updated_at: string;
}

// Define the full ShiftReport with all fields needed by the UI components
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

// Simple admin interface without nested types
interface AdminProfile {
  id: string;
  name: string | null;
  email: string | null;
}

export const useShiftSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const submitShiftReport = async (reportData: ShiftReportInput): Promise<DBShiftReport> => {
    setIsSubmitting(true);
    try {
      if (!currentUser) {
        throw new Error("User not authenticated.");
      }

      // Define the data to insert with explicit typing
      const reportToInsert = {
        ...reportData,
        user_id: currentUser.id,
        submitted_by: currentUser.name || currentUser.email,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      };

      // Insert the report with explicit typing for the response
      const { data, error: shiftReportError } = await supabase
        .from('shift_reports')
        .insert([reportToInsert])
        .select();

      if (shiftReportError) {
        console.error("Error submitting shift report:", shiftReportError);
        throw new Error(`Failed to submit shift report: ${shiftReportError.message}`);
      }

      // Get the first report from the data array
      const shiftReport = data?.[0] as DBShiftReport;
      if (!shiftReport) {
        throw new Error("Failed to retrieve the created shift report");
      }

      // Use specific types and explicit field selection without chaining
      // This breaks the deep type inference chain that causes TS2589
      const profilesResponse = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'admin');

      // Handle and parse the response explicitly
      const adminsError = profilesResponse.error;
      const admins = profilesResponse.data as AdminProfile[] | null;

      if (adminsError) {
        console.error("Error fetching admins:", adminsError);
        throw new Error(`Failed to fetch admins: ${adminsError.message}`);
      }

      // Process admins using a simple array
      if (admins && admins.length > 0) {
        // Notify each admin
        for (const admin of admins) {
          await notifyAdmin(
            admin.id,
            admin.name || 'Admin',
            admin.email || '',
            shiftReport.id,
            reportData.priority
          );
        }
      } else {
        console.warn("No admins found to notify.");
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

  // Use only primitives to avoid complex type relationships
  const notifyAdmin = async (
    adminId: string,
    adminName: string,
    adminEmail: string,
    shiftReportId: string,
    priority: string
  ): Promise<boolean> => {
    try {
      if (!currentUser || !adminId) return false;
      
      const { error: notifyError } = await supabase.functions.invoke('notify-manager', {
        body: { 
          admin: {
            id: adminId,
            name: adminName,
            email: adminEmail
          },
          reportId: shiftReportId, 
          priority, 
          reportUserName: currentUser.name || 'Employee'
        }
      });

      if (notifyError) {
        console.error('Error sending notification:', notifyError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Use DBShiftReport for the mutation return type to be explicit
  const mutation = useMutation<DBShiftReport, Error, ShiftReportInput>({
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
