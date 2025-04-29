
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShiftReportForm } from "@/components/reports/ShiftReportForm";
import { ShiftReportList } from "@/components/reports/ShiftReportList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Reports() {
  const { loading, error } = useEmployeeDirectory();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Shift Reports</h1>
          <p className="text-muted-foreground">Log and view shift reports</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading employees: {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-muted-foreground">Loading employee data...</p>
          </div>
        ) : (
          <Tabs defaultValue="submit" className="space-y-4">
            <TabsList>
              <TabsTrigger value="submit">Submit Report</TabsTrigger>
              <TabsTrigger value="view">View Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="submit" className="space-y-4">
              <ShiftReportForm />
            </TabsContent>
            
            <TabsContent value="view">
              <ShiftReportList />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
