
import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeModal } from "@/hooks/useEmployeeModal";
import { EmployeeHeader } from "@/components/employee/EmployeeHeader";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { EmployeeContent } from "@/components/employee/EmployeeContent";
import { EmployeeModals } from "@/components/employee/EmployeeModals";
import { EmployeeAssignments } from "@/components/employee/EmployeeAssignments";
import { toast } from "sonner";

export default function Employees() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal
  } = useEmployeeModal();

  const {
    searchQuery,
    setSearchQuery,
    employees,
    loading,
    error,
    refetch,
  } = useEmployeeDirectory();

  const [resetEmployee, setResetEmployee] = useState<UserType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(`Error loading employees: ${error}`);
    }
    
    // Log the employee count on each render to help with debugging
    console.log(`Displaying ${employees.length} employees`);
  }, [employees.length, error]);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEmployeeCreated = useCallback(() => {
    setIsAddModalOpen(false);
    console.log("Employee created - refreshing list...");
    // Run the refetch with a slight delay to ensure database updates are complete
    setTimeout(() => {
      refetch();
    }, 500);
  }, [refetch]);

  const handleEditEmployee = useCallback((employee: UserType) => {
    console.log("Editing employee:", employee);
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  }, []);
  
  const handleViewEmployee = useCallback((employee: UserType) => {
    openModal(employee);
  }, [openModal]);
  
  const handleDeleteEmployee = useCallback((id: string) =>
    import("sonner").then(({ toast }) => toast.info(`Delete employee with ID ${id} - Coming soon!`)), []);
  
  const handleEmployeeUpdate = useCallback(() => {
    console.log("Employee updated - refreshing list");
    setIsUpdating(true);
    
    // Use a timeout to avoid UI freezing during state updates
    setTimeout(() => {
      refetch().finally(() => {
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditingEmployee(null);
          setIsUpdating(false);
        }, 50);
      });
    }, 300);
  }, [refetch]);
  
  const handleResetPassword = useCallback((employee: UserType) => setResetEmployee(employee), []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    // Small delay before clearing the employee data to prevent UI jank
    setTimeout(() => {
      setEditingEmployee(null);
    }, 100);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-8">
        <EmployeeHeader 
          onAddEmployee={handleAddEmployee} 
          isAdmin={isAdmin}
        />
        
        <EmployeeContent 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          employees={employees}
          loading={loading || isUpdating}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          onResetPassword={handleResetPassword}
          onView={handleViewEmployee}
          isAdmin={isAdmin}
          error={error}
        />

        {isAdmin && <EmployeeAssignments />}
      </div>
      <EmployeeModals 
        selectedEmployee={editingEmployee || selectedEmployee}
        isDetailModalOpen={isDetailModalOpen}
        closeDetailModal={closeModal}
        handleEmployeeUpdate={handleEmployeeUpdate}
        resetEmployee={resetEmployee}
        setResetEmployee={setResetEmployee}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleEmployeeCreated={handleEmployeeCreated}
        isEditModalOpen={isEditModalOpen}
        closeEditModal={closeEditModal}
      />
    </DashboardLayout>
  );
}
