
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShiftReportForm } from "@/components/reports/ShiftReportForm";
import { ShiftReportList } from "@/components/reports/ShiftReportList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { formatErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const { employees, loading, error, refetch } = useEmployeeDirectory();

  const handleRetry = () => {
    console.log("Retrying employee data fetch");
    refetch();
  };

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
            <AlertDescription className="flex justify-between w-full items-center">
              <span>Error loading employees: {formatErrorMessage(error)}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="whitespace-nowrap ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-2" /> Retry
              </Button>
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
