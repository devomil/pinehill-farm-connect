
import React from "react";
import { User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeForm } from "./EmployeeForm";

interface EmployeeEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmployee: User | null;
  onSaveEdit: (editedEmployee: any) => Promise<void>;
}

export function EmployeeEditDialog({
  isOpen,
  onOpenChange,
  currentEmployee,
  onSaveEdit
}: EmployeeEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information.
          </DialogDescription>
        </DialogHeader>
        {currentEmployee && (
          <EmployeeForm 
            onSubmit={onSaveEdit} 
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
  );
}
