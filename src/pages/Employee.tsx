
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Employee = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
        <div className="bg-white rounded-md shadow p-6">
          <p>Employee management content will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Employee;
