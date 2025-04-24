
import React from "react";
import { User } from "@/types";
import { CommunicationHeader } from "@/components/communication/CommunicationHeader";

interface AnnouncementHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  loading?: boolean;
}

export const AnnouncementHeader: React.FC<AnnouncementHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  loading
}) => {
  return (
    <CommunicationHeader 
      isAdmin={isAdmin}
      allEmployees={allEmployees}
      onAnnouncementCreate={onAnnouncementCreate}
      loading={loading}
    />
  );
};
