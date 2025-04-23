
import React from "react";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { User } from "@/types";

interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
}

export const CommunicationHeader: React.FC<CommunicationHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">Company announcements and important information</p>
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
