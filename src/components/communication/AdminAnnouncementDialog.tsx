
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { NewAnnouncementForm } from "@/components/communication/announcement/NewAnnouncementForm";

export interface AdminAnnouncementDialogProps {
  allEmployees: User[];
  onCreate: (formData: any) => void; // Updated to accept formData
  open?: boolean;
  onClose?: () => void;
}

export const AdminAnnouncementDialog: React.FC<AdminAnnouncementDialogProps> = ({
  allEmployees,
  onCreate,
  open,
  onClose
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // If external state is provided, use it; otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleCreate = (formData: any) => { // Updated to accept and pass formData
    onCreate(formData);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> New Announcement
          </DialogTitle>
        </DialogHeader>
        <NewAnnouncementForm 
          allEmployees={allEmployees} 
          onSubmitSuccess={handleCreate} 
        />
      </DialogContent>
    </Dialog>
  );
};
