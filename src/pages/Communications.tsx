
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";

export default function Communications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Communicate with your colleagues and manage shift coverage requests
          </p>
        </div>
        <EmployeeCommunications />
      </div>
    </DashboardLayout>
  );
}
