
import React from "react";
import { EmployeePageHeader } from "./EmployeePageHeader";
import { EmployeeEditDialog } from "./EmployeeEditDialog";
import { EmployeeList } from "./EmployeeList";
import { useEmployeeManagement } from "@/hooks/employee/useEmployeeManagement";

export const EmployeeManagement: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    isFormOpen,
    setIsFormOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentEmployee,
    filteredEmployees,
    loading,
    error,
    handleEditEmployee,
    handleAddEmployee,
    handleDeleteEmployee,
    handleSaveEdit,
    refetch
  } = useEmployeeManagement();

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        onAddEmployee={handleAddEmployee}
      />
      
      <EmployeeList
        filteredEmployees={filteredEmployees}
        loading={loading}
        error={error}
        onUpdateEmployee={async (id, updatedEmployee) => {
          await handleDeleteEmployee(id);
        }}
        onDeleteEmployee={handleDeleteEmployee}
        onEditEmployee={handleEditEmployee}
        onRetry={refetch}
      />

      <EmployeeEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentEmployee={currentEmployee}
        onSaveEdit={handleSaveEdit}
      />
    </div>
  );
};
