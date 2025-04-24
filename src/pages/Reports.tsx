
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShiftReportForm } from "@/components/reports/ShiftReportForm";
import { ShiftReportList } from "@/components/reports/ShiftReportList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Shift Reports</h1>
          <p className="text-muted-foreground">Log and view shift reports</p>
        </div>

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
      </div>
    </DashboardLayout>
  );
}
