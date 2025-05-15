
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { DBShiftReport, ShiftReportInput } from "../types/shiftReportTypes";
import { toast } from "@/hooks/use-toast";
import { fetchAdmins } from "./adminService";
import { notifyAdmin } from "./notificationService";

export async function submitShiftReport(
  reportData: ShiftReportInput, 
  currentUser: User | null
): Promise<DBShiftReport> {
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
            reportData.priority,
            currentUser
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
  }
}
