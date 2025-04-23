
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeModal } from "@/hooks/useEmployeeModal";
import { EmployeeHeader } from "@/components/employee/EmployeeHeader";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeContent } from "@/components/employee/EmployeeContent";
import { EmployeeModals } from "@/components/employee/EmployeeModals";

export default function Employees() {
  const { currentUser } = useAuth();
  const {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal
  } = useEmployeeModal();

  const { searchQuery, setSearchQuery, employees, loading, refetch } = useEmployees();
  const [resetEmployee, setResetEmployee] = useState<UserType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEmployeeCreated = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditEmployee = (employee: UserType) => openModal(employee);
  const handleDeleteEmployee = (id: string) =>
    import("sonner").then(({ toast }) => toast.info(`Delete employee with ID ${id} - Coming soon!`));
  const handleEmployeeUpdate = () => refetch();
  const handleResetPassword = (employee: UserType) => setResetEmployee(employee);

  return (
    <DashboardLayout requireAdmin={true}>
      <EmployeeHeader onAddEmployee={handleAddEmployee} />
      
      <EmployeeContent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        employees={employees}
        loading={loading}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onResetPassword={handleResetPassword}
        isAdmin={currentUser && currentUser.role === "admin"}
      />

      <EmployeeModals
        selectedEmployee={selectedEmployee}
        isDetailModalOpen={isDetailModalOpen}
        closeDetailModal={closeModal}
        handleEmployeeUpdate={handleEmployeeUpdate}
        resetEmployee={resetEmployee}
        setResetEmployee={setResetEmployee}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleEmployeeCreated={handleEmployeeCreated}
      />
    </DashboardLayout>
  );
}
