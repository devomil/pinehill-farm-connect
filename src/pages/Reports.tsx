
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Shift Reports</h1>
            <p className="text-muted-foreground">Log issues and information from shifts</p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        <div className="text-center py-16">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Shift Reporting coming soon</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            This feature is currently under development. Soon you'll be able to submit shift reports with photo uploads and automatic categorization.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
