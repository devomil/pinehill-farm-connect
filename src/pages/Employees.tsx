
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeDetailModal } from "@/components/employee/EmployeeDetailModal";
import { EmployeeSearchBar } from "@/components/employee/EmployeeSearchBar";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { useEmployeeModal } from "@/hooks/useEmployeeModal";
import { EmployeeHeader } from "@/components/employee/EmployeeHeader";
import { EmployeeResetPasswordDialog } from "@/components/employee/EmployeeResetPasswordDialog";
import { useEmployees } from "@/hooks/useEmployees";

export default function Employees() {
  const { currentUser } = useAuth();
  const {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal
  } = useEmployeeModal();

  // Refactored employee state logic
  const { searchQuery, setSearchQuery, employees, loading, refetch } = useEmployees();

  const [resetEmployee, setResetEmployee] = useState<UserType | null>(null);

  const handleAddEmployee = () => {
    // Coming soon
    import("sonner").then(({ toast }) => toast.info("This feature is coming soon!"));
  };
  const handleEditEmployee = (employee: UserType) => openModal(employee);
  const handleDeleteEmployee = (id: string) =>
    import("sonner").then(({ toast }) => toast.info(`Delete employee with ID ${id} - Coming soon!`));
  const handleEmployeeUpdate = () => refetch();
  const handleResetPassword = (employee: UserType) => setResetEmployee(employee);

  return (
    <DashboardLayout requireAdmin={true}>
      <EmployeeHeader onAddEmployee={handleAddEmployee} />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employees Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeSearchBar value={searchQuery} onChange={setSearchQuery} />
          <EmployeeTable
            employees={employees}
            loading={loading}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            onResetPassword={handleResetPassword}
            isAdmin={currentUser && currentUser.role === "admin"}
          />
        </CardContent>
      </Card>
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        employee={selectedEmployee}
        onEmployeeUpdate={handleEmployeeUpdate}
      />
      <EmployeeResetPasswordDialog
        employee={resetEmployee}
        open={!!resetEmployee}
        setOpen={open => !open ? setResetEmployee(null) : void 0}
      />
    </DashboardLayout>
  );
}
