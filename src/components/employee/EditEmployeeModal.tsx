
import React, { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User } from "@/types";
import { useEmployeeEditForm } from "./hooks/useEmployeeEditForm";
import { EditEmployeeForm } from "./EditEmployeeForm";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EditEmployeeModalProps) {
  const {
    form,
    employeeData,
    employeeHR,
    selectedRoles,
    isLoading,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    handleSubmit,
    handleClose,
    resetFormWithEmployeeData,
    setEmployeeHR
  } = useEmployeeEditForm(employee, onEmployeeUpdate, onClose);

  // Memoize the reset function to prevent unnecessary re-renders
  const resetForm = useCallback(() => {
    if (employee) {
      console.log("Calling resetFormWithEmployeeData for:", employee.name);
      resetFormWithEmployeeData();
    }
  }, [employee, resetFormWithEmployeeData]);

  // Reset form when employee changes or modal opens/closes
  useEffect(() => {
    if (isOpen && employee) {
      // Small delay to ensure the modal is fully rendered before resetting the form
      const timeoutId = setTimeout(resetForm, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [employee, isOpen, resetForm]);

  // Safe guard to prevent rendering if employee is null
  if (!employee) return null;

  const handleSubmitWrapper = (data: any) => {
    console.log("Submit wrapper called with data:", data);
    handleSubmit(data);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // Use requestAnimationFrame to handle closing for better performance
          requestAnimationFrame(() => {
            handleClose();
          });
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee: {employee.name}</DialogTitle>
          <DialogDescription>
            Make changes to employee information below
          </DialogDescription>
        </DialogHeader>
        
        <EditEmployeeForm
          employee={employee}
          form={form}
          employeeData={employeeData}
          employeeHR={employeeHR}
          selectedRoles={selectedRoles}
          isLoading={isLoading}
          handleBasicInfoChange={handleBasicInfoChange}
          handleHRDataChange={handleHRDataChange}
          handleRoleChange={handleRoleChange}
          setEmployeeHR={setEmployeeHR}
          onSubmit={handleSubmitWrapper}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
