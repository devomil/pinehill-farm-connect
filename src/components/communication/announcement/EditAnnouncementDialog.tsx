
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminAnnouncementForm } from "@/components/communication/AdminAnnouncementForm";
import { Announcement, User } from "@/types";

interface EditAnnouncementDialogProps {
  announcement: Announcement | null;
  allEmployees: User[];
  onClose: () => void;
  onSave: () => void;
}

export const EditAnnouncementDialog = ({
  announcement,
  allEmployees,
  onClose,
  onSave,
}: EditAnnouncementDialogProps) => {
  if (!announcement) return null;

  return (
    <Dialog open={!!announcement} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <AdminAnnouncementForm
          initialData={announcement}
          allEmployees={allEmployees}
          onCreate={onSave}
          closeDialog={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
