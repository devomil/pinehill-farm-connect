
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeOffRequestForm } from "./TimeOffRequestForm";
import { User } from "@/types";

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  currentUser: User;
  allEmployees: User[];
}

export const NewRequestDialog: React.FC<NewRequestDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  onSubmit,
  currentUser,
  allEmployees,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Time-Off Request</DialogTitle>
        </DialogHeader>
        <TimeOffRequestForm 
          onSubmit={onSubmit} 
          onCancel={onClose}
          currentUser={currentUser}
        />
      </DialogContent>
    </Dialog>
  );
};
