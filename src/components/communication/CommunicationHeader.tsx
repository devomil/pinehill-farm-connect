
import React from "react";
import { User } from "@/types";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { Heading } from "@/components/ui/heading";

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
    <div>
      <Heading 
        title="Communication Center" 
        description="View and manage company announcements and communications."
      />
    </div>
  );
};
