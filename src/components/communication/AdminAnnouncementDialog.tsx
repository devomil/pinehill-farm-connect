
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Announcements appear in Communication Center for all recipients. Attachments are optional.
          </DialogDescription>
        </DialogHeader>
        <AdminAnnouncementForm
          allEmployees={allEmployees}
          onCreate={onCreate}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

