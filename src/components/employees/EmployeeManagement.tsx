
import React, { useState, useCallback } from "react";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useToast } from "@/hooks/use-toast";
import { formatErrorMessage } from "@/utils/errorUtils";
import { EmployeePageHeader } from "./EmployeePageHeader";
import { EmployeePageContent } from "./EmployeePageContent";
import { EmployeeEditDialog } from "./EmployeeEditDialog";

export function EmployeeManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch,
  } = useEmployeeDirectory();
  
  const { toast } = useToast();

  const handleAddEmployee = async (newEmployee: any) => {
    try {
      await addEmployee(newEmployee);
      toast({
        description: `${newEmployee.name} has been added to the employee directory.`,
        variant: "success"
      });
      setIsFormOpen(false);
    } catch (err) {
      toast({
        description: formatErrorMessage(err),
        variant: "destructive"
      });
    }
  };

  const handleUpdateEmployee = async (id: string, updatedEmployee: any) => {
    try {
      // Store the employee to be edited and open the edit dialog
      const employeeToEdit = employees.find(emp => emp.id === id);
      if (employeeToEdit) {
        setCurrentEmployee(employeeToEdit);
        setIsEditDialogOpen(true);
      } else {
        toast({
          description: "Employee not found",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        description: formatErrorMessage(err),
        variant: "destructive"
      });
    }
  };

  const handleSaveEdit = async (editedEmployee: any) => {
    if (!currentEmployee) return;
    
    try {
      await updateEmployee(currentEmployee.id, editedEmployee);
      toast({
        description: `${editedEmployee.name} has been updated.`,
        variant: "success"
      });
      setIsEditDialogOpen(false);
      setCurrentEmployee(null);
      refetch(); // Refresh the employee list
    } catch (err) {
      toast({
        description: formatErrorMessage(err),
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      toast({
        description: "Employee has been removed from the directory.",
        variant: "success"
      });
    } catch (err) {
      toast({
        description: formatErrorMessage(err),
        variant: "destructive"
      });
    }
  };

  const handleRetry = useCallback(() => {
    refetch();
    toast({
      description: "Attempting to reload employee data...",
      variant: "default"
    });
  }, [refetch, toast]);

  const filteredEmployees = React.useMemo(() => {
    if (!employees) return [];
    return employees.filter((employee) => {
      const searchStr = `${employee.name} ${employee.email} ${employee.employeeId}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [employees, searchQuery]);

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        onAddEmployee={handleAddEmployee}
      />

      <EmployeePageContent
        filteredEmployees={filteredEmployees}
        loading={loading}
        error={error}
        onUpdateEmployee={handleUpdateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onRetry={handleRetry}
      />

      <EmployeeEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentEmployee={currentEmployee}
        onSaveEdit={handleSaveEdit}
      />
    </div>
  );
}
