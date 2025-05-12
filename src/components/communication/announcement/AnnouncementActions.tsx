
import React, { useState, useCallback } from "react";
import { Announcement, User } from "@/types";
import { EditAnnouncementDialog } from "@/components/communication/announcement/EditAnnouncementDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash } from "lucide-react";

// Component for the actions dropdown in the announcement card
interface AnnouncementActionsProps {
  announcement: Announcement;
  onEdit: () => void;
  onDelete: () => void;
}

export const AnnouncementActions: React.FC<AnnouncementActionsProps> = ({
  announcement,
  onEdit,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Original component for handling announcement editing dialog
interface AnnouncementActionsManagerProps {
  editingAnnouncement: Announcement | null;
  setEditingAnnouncement: React.Dispatch<React.SetStateAction<Announcement | null>>;
  handleSaveEdit: (announcement: Announcement) => Promise<void>;
  loading: boolean;
  allEmployees: User[];
}

export const AnnouncementActionsManager: React.FC<AnnouncementActionsManagerProps> = ({
  editingAnnouncement,
  setEditingAnnouncement,
  handleSaveEdit,
  loading,
  allEmployees
}) => {
  const handleCloseEditDialog = useCallback(() => {
    setEditingAnnouncement(null);
  }, [setEditingAnnouncement]);

  if (!editingAnnouncement) return null;

  return (
    <EditAnnouncementDialog
      announcement={editingAnnouncement}
      allEmployees={allEmployees}
      onClose={handleCloseEditDialog}
      onSave={handleSaveEdit}
      loading={loading}
    />
  );
};
