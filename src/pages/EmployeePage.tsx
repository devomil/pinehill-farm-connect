
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmployeeManagement } from "@/components/employees/EmployeeManagement";
import { PageContainer } from "@/components/ui/page-container";

const EmployeePage: React.FC = () => {
  return (
    <DashboardLayout>
      <PageContainer maxWidth="full" padding="none">
        <EmployeeManagement />
      </PageContainer>
    </DashboardLayout>
  );
};

export default EmployeePage;
