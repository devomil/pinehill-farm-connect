
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
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
  assignedTo?: string; // Add the assignedTo property that was missing
}

type ShiftReportInput = Omit<ShiftReport, 'id' | 'created_at' | 'submitted_by' | 'submitted_at' | 'status'>;

// Simple type for admin data
interface AdminProfile {
  id: string;
  name: string;
  email: string;
}

export const useShiftSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  // Separate function to fetch admins
  const fetchAdmins = async (): Promise<AdminProfile[]> => {
    try {
      const supabaseUrl = "https://pdeaxfhsodenefeckabm.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZWF4Zmhzb2RlbmVmZWNrYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzIxNTcsImV4cCI6MjA2MDkwODE1N30.Na375_2UPefjCbmBLrWWwhX0G6QhZuyrUxgQieV1TlA";
      
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,name,email&role=eq.admin`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      
      const admins: AdminProfile[] = await response.json();
      return admins || [];
    } catch (error) {
      console.error("Error fetching admins:", error);
      return [];
    }
  };

  const submitShiftReport = async (reportData: ShiftReportInput): Promise<DBShiftReport> => {
    setIsSubmitting(true);
    try {
      if (!currentUser) {
        throw new Error("User not authenticated.");
      }

      // Create a simple object with the exact properties expected by the database
      const insertData = {
        user_id: currentUser.id,
        date: reportData.date,
        notes: reportData.notes,
        priority: reportData.priority,
        admin_id: reportData.assignedTo || null
      };

      // Insert the report
      const { error: insertError } = await supabase
        .from('shift_reports')
        .insert([insertData]);

      if (insertError) {
        console.error("Error submitting shift report:", insertError);
        throw new Error(`Failed to submit shift report: ${insertError.message}`);
      }

      // Fetch the inserted report separately to get its ID
      const { data: fetchedReports, error: fetchError } = await supabase
        .from('shift_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .eq('user_id', currentUser.id);

      if (fetchError) {
        throw new Error(`Failed to retrieve report: ${fetchError.message}`);
      }

      const shiftReport = fetchedReports?.[0] as DBShiftReport;
      if (!shiftReport) {
        throw new Error("Failed to retrieve the created shift report");
      }

      // Fetch admins and notify them
      const admins = await fetchAdmins();
      
      if (admins && admins.length > 0) {
        for (let i = 0; i < admins.length; i++) {
          const admin = admins[i];
          if (admin && admin.id) {
            await notifyAdmin(
              admin.id,
              admin.name || 'Admin',
              admin.email || '',
              shiftReport.id,
              reportData.priority
            );
          }
        }
      } else {
        console.warn("No admins found to notify.");
      }

      toast({
        description: 'Shift report submitted successfully!',
        variant: 'success'
      });
      return shiftReport;

    } catch (error: any) {
      console.error("Error in submitShiftReport:", error.message);
      toast({
        description: `Failed to submit shift report: ${error.message}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Notification logic with primitive types only
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

  // Explicitly type the mutation return type
  const mutation = useMutation<DBShiftReport, Error, ShiftReportInput>({
    mutationFn: submitShiftReport,
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
