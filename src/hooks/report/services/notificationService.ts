
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { AdminProfile } from "../types/shiftReportTypes";

export async function notifyAdmin(
  adminId: string,
  adminName: string,
  adminEmail: string,
  shiftReportId: string,
  priority: string,
  currentUser: User | null
): Promise<boolean> {
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
}
