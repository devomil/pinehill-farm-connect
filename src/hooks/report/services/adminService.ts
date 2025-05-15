
import { AdminProfile } from "../types/shiftReportTypes";

export async function fetchAdmins(): Promise<AdminProfile[]> {
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
}
