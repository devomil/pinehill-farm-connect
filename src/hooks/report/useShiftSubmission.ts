
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

// Define a simple standalone interface for admin data to break circular references
interface AdminBasicInfo {
  id: string;
  name?: string | null;
  email?: string | null;
}

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

      // Use simpler types and avoid TypeScript recursion with explicit typing
      // Fetch admin profiles
      const { data: adminData, error: adminsError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'admin');

      if (adminsError) {
        console.error("Error fetching admins:", adminsError);
        throw new Error(`Failed to fetch admins: ${adminsError.message}`);
      }

      // Create a simple array of admin objects with explicit types
      // This avoids TypeScript having to deeply analyze the types
      const admins: AdminBasicInfo[] = [];
      
      if (Array.isArray(adminData)) {
        for (const admin of adminData) {
          admins.push({
            id: admin.id,
            name: admin.name,
            email: admin.email
          });
        }
      }
      
      if (admins.length === 0) {
        console.warn("No admins found to notify.");
      } else {
        // Use primitive types to avoid deep nesting
        for (const admin of admins) {
          await notifyAdmin(
            admin.id,
            admin.name || 'Admin',
            admin.email || '',
            shiftReport.id,
            reportData.priority
          );
        }
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

  // Use primitive types instead of complex objects to avoid type recursion
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

  // Explicitly type the mutation with Error type to avoid deep recursion
  const mutation = useMutation<any, Error, ShiftReportInput>({
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
