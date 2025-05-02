
import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserTable } from "@/components/employees/UserTable";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatErrorMessage } from "@/utils/errorUtils";
import { User } from "@/types";

export default function Employees() {
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
        title: "Employee added successfully!",
        description: `${newEmployee.name} has been added to the employee directory.`,
      });
      setIsFormOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error adding employee",
        description: formatErrorMessage(err),
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
          variant: "destructive",
          title: "Error",
          description: "Employee not found",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error updating employee",
        description: formatErrorMessage(err),
      });
    }
  };

  const handleSaveEdit = async (editedEmployee: any) => {
    if (!currentEmployee) return;
    
    try {
      await updateEmployee(currentEmployee.id, editedEmployee);
      toast({
        title: "Employee updated successfully!",
        description: `${editedEmployee.name} has been updated.`,
      });
      setIsEditDialogOpen(false);
      setCurrentEmployee(null);
      refetch(); // Refresh the employee list
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error updating employee",
        description: formatErrorMessage(err),
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      toast({
        title: "Employee deleted successfully!",
        description: "Employee has been removed from the directory.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error deleting employee",
        description: formatErrorMessage(err),
      });
    }
  };

  const handleRetry = useCallback(() => {
    refetch();
    toast({
      title: "Attempting to reload employee data...",
      description: "Retrying data fetch.",
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Employee Directory</h1>
            <p className="text-muted-foreground">
              Manage and view all employees
            </p>
          </div>
          <div className="space-x-2 flex items-center">
            <Label htmlFor="search">Search:</Label>
            <Input
              id="search"
              type="search"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Employee</DialogTitle>
                  <DialogDescription>
                    Create a new employee account.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm onSubmit={handleAddEmployee} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        <UserTable
          employees={filteredEmployees}
          loading={loading}
          error={error}
          onUpdate={handleUpdateEmployee}
          onDelete={handleDeleteEmployee}
          onRetry={handleRetry}
        />

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information.
              </DialogDescription>
            </DialogHeader>
            {currentEmployee && (
              <EmployeeForm 
                onSubmit={handleSaveEdit} 
                initialValues={{
                  name: currentEmployee.name || '',
                  email: currentEmployee.email || '',
                  department: currentEmployee.department || '',
                  position: currentEmployee.position || '',
                  employeeId: currentEmployee.employeeId || '',
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
