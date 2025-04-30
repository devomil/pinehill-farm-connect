
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    resetFormWithEmployeeData
  } = useEmployeeEditForm(employee, onEmployeeUpdate, onClose);

  // Reset form when employee changes or modal opens/closes
  useEffect(() => {
    if (isOpen && employee) {
      resetFormWithEmployeeData();
    }
  }, [employee, isOpen]);

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee: {employee.name}</DialogTitle>
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
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
