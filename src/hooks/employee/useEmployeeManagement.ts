
import { useState } from "react";
import { User } from "@/types";
import { useEmployeeDirectory } from "./useEmployeeDirectory";
import { useEmployeeModifications } from "./useEmployeeModifications";

export const useEmployeeManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<User | null>(null);

  const {
    employees,
    loading,
    error,
    refetch
  } = useEmployeeDirectory();

  const {
    updateEmployee,
    deleteEmployee,
    addEmployee
  } = useEmployeeModifications();

  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEmployee = (employee: User) => {
    setCurrentEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleAddEmployee = async (newEmployee: any) => {
    await addEmployee(newEmployee);
    setIsFormOpen(false);
    refetch();
  };

  const handleUpdateEmployee = async (id: string, updatedEmployee: any) => {
    await updateEmployee(id, updatedEmployee);
    setIsEditDialogOpen(false);
    setCurrentEmployee(null);
    refetch();
  };

  const handleDeleteEmployee = async (id: string) => {
    await deleteEmployee(id);
    refetch();
  };

  const handleSaveEdit = async (editedEmployee: any) => {
    if (currentEmployee) {
      await handleUpdateEmployee(currentEmployee.id, editedEmployee);
    }
  };

  return {
    // State
    searchQuery,
    setSearchQuery,
    isFormOpen,
    setIsFormOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentEmployee,
    
    // Data
    employees,
    filteredEmployees,
    loading,
    error,
    
    // Actions
    handleEditEmployee,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleSaveEdit,
    refetch
  };
};
