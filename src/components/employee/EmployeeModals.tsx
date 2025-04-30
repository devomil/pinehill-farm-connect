
import React from "react";
import { User } from "@/types";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { EmployeeResetPasswordDialog } from "./EmployeeResetPasswordDialog";
import { EditEmployeeModal } from "./EditEmployeeModal";

interface EmployeeModalsProps {
  selectedEmployee: User | null;
  isDetailModalOpen: boolean;
  closeDetailModal: () => void;
  handleEmployeeUpdate: () => void;
  resetEmployee: User | null;
  setResetEmployee: React.Dispatch<React.SetStateAction<User | null>>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEmployeeCreated: () => void;
  isEditModalOpen: boolean;
  closeEditModal: () => void;
}

export function EmployeeModals({
  selectedEmployee,
  isDetailModalOpen,
  closeDetailModal,
  handleEmployeeUpdate,
  resetEmployee,
  setResetEmployee,
  isAddModalOpen,
  setIsAddModalOpen,
  handleEmployeeCreated,
  isEditModalOpen,
  closeEditModal,
}: EmployeeModalsProps) {
  return (
    <>
      {/* View Employee Details Modal */}
      {isDetailModalOpen && (
        <EmployeeDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          employee={selectedEmployee}
          onEmployeeUpdate={handleEmployeeUpdate}
        />
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <EditEmployeeModal 
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          employee={selectedEmployee}
          onEmployeeUpdate={handleEmployeeUpdate}
        />
      )}

      {/* Password Reset Dialog */}
      {resetEmployee && (
        <EmployeeResetPasswordDialog
          isOpen={!!resetEmployee}
          onClose={() => setResetEmployee(null)}
          employee={resetEmployee}
        />
      )}
    </>
  );
}
