
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { Loader2 } from "lucide-react";

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
        loading ? (
          <Button disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        ) : (
          <AdminAnnouncementDialog 
            allEmployees={allEmployees} 
            onCreate={onAnnouncementCreate}
          />
        )
      )}
    </div>
  );
};
