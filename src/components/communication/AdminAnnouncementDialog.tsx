
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { User } from "@/types";
import { AdminAnnouncementForm } from "./AdminAnnouncementForm";

interface AdminAnnouncementDialogProps {
  allEmployees: User[];
  onCreate: () => void;
}

export const AdminAnnouncementDialog: React.FC<AdminAnnouncementDialogProps> = ({
  allEmployees,
  onCreate,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleCreateSuccess = () => {
    setOpen(false);
    onCreate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Announcements appear in Communication Center for all recipients. Attachments are optional.
          </DialogDescription>
        </DialogHeader>
        <AdminAnnouncementForm
          allEmployees={allEmployees}
          onCreate={handleCreateSuccess}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
