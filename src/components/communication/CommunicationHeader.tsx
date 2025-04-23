
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";

interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  loading?: boolean;
}

export const CommunicationHeader: React.FC<CommunicationHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  loading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communication Center</h1>
        <p className="text-muted-foreground">
          View and manage company announcements and communications.
        </p>
      </div>
      {isAdmin && (
        <AdminAnnouncementDialog 
          allEmployees={allEmployees} 
          onCreate={onAnnouncementCreate}
        />
      )}
    </div>
  );
};
