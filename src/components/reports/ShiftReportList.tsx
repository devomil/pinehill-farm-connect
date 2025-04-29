
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ShiftReportList() {
  const { employees, error: employeeError } = useEmployeeDirectory();
  const { data: reports, isLoading } = useQuery({
    queryKey: ['shiftReports'],
    queryFn: async () => {
      // First get all shift reports
      const { data: reportData, error: reportError } = await supabase
        .from('shift_reports')
        .select('id, user_id, admin_id, date, notes, priority, created_at, updated_at')
        .order('date', { ascending: false });

      if (reportError) throw reportError;

      // Then fetch user and admin profiles for each report
      const result = await Promise.all((reportData || []).map(async (report) => {
        // Get user profile
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', report.user_id)
          .maybeSingle();

        if (userError) console.error('Error fetching user profile:', userError);

        // Get admin profile if exists
        let adminProfile = null;
        if (report.admin_id) {
          const { data: adminData, error: adminError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', report.admin_id)
            .maybeSingle();

          if (adminError) {
            console.error('Error fetching admin profile:', adminError);
          } else {
            adminProfile = adminData;
          }
        }

        return {
          ...report,
          user: userProfile || null,
          admin: adminProfile || null
        };
      }));

      return result;
    }
  });

  if (isLoading) return <div>Loading reports...</div>;
  
  if (reports?.length === 0) {
    return (
      <Alert className="my-4 bg-blue-50 text-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>No reports found. Create a new report to get started.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {employeeError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{employeeError}</AlertDescription>
        </Alert>
      )}
      
      {reports?.map((report) => (
        <Card 
          key={report.id} 
          className={`border-l-4 ${
            report.priority === 'high' ? 'border-l-red-500' :
            report.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
          }`}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{format(new Date(report.date), 'PPP')}</span>
              <span className="text-sm font-normal">
                By: {report?.user?.name || 'Unknown'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{report.notes}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                report.priority === 'high' ? 'bg-red-100 text-red-800' :
                report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
              </span>
              {report.admin_id && (
                <span className="text-sm text-muted-foreground">
                  Assigned to admin: {report?.admin?.name || 'Unknown'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
