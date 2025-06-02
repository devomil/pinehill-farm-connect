
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmployeeManagement } from "@/components/employees/EmployeeManagement";

const EmployeePage: React.FC = () => {
  return (
    <DashboardLayout>
      <EmployeeManagement />
    </DashboardLayout>
  );
};

export default EmployeePage;
