
import React from "react";
import { User } from "@/types";
import { AdminAnnouncementDialog } from "@/components/communication/AdminAnnouncementDialog";
import { Heading } from "@/components/ui/heading";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div>
      <Heading title="Communication Center" 
        description="View and manage company announcements and communications." 
      />
      {isAdmin && loading && (
        <Button disabled className="mt-2">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      )}
    </div>
  );
};
