
import { User as UserType } from "@/types";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { EmployeeResetPasswordDialog } from "./EmployeeResetPasswordDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddEmployeeForm } from "./AddEmployeeForm";

interface EmployeeModalsProps {
  selectedEmployee: UserType | null;
  isDetailModalOpen: boolean;
  closeDetailModal: () => void;
  handleEmployeeUpdate: () => void;
  resetEmployee: UserType | null;
  setResetEmployee: (employee: UserType | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  handleEmployeeCreated: () => void;
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
}: EmployeeModalsProps) {
  return (
    <>
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        employee={selectedEmployee}
        onEmployeeUpdate={handleEmployeeUpdate}
      />

      <EmployeeResetPasswordDialog
        employee={resetEmployee}
        open={!!resetEmployee}
        setOpen={open => !open ? setResetEmployee(null) : void 0}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <AddEmployeeForm
            onSuccess={handleEmployeeCreated}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
