
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export function ShiftReportList() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['shiftReports'],
    queryFn: async () => {
      // The issue is with the join syntax - we need to use a foreign table reference
      // that properly connects shift_reports with profiles
      const { data, error } = await supabase
        .from('shift_reports')
        .select(`
          *,
          profiles(name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-4">
      {reports?.map((report) => (
        <Card key={report.id} className={`border-l-4 ${
          report.priority === 'high' ? 'border-l-red-500' :
          report.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
        }`}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{format(new Date(report.date), 'PPP')}</span>
              <span className="text-sm font-normal">
                By: {report.profiles?.name || 'Unknown'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{report.notes}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                report.priority === 'high' ? 'bg-red-100 text-red-800' :
                report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
