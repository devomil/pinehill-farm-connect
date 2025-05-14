
import React from "react";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { User } from "@/types";

interface CommunicationContentProps {
  activeTab: string;
  currentUser: User | null;
  unfilteredEmployees: User[];
  isAdmin: boolean;
}

// Use React.memo to prevent unnecessary re-renders when props don't change
export const CommunicationContent = React.memo<CommunicationContentProps>(({
  activeTab,
  currentUser,
  unfilteredEmployees,
  isAdmin
}) => {
  // Only render the component for the active tab to avoid unnecessary data fetching
  return (
    <>
      {activeTab === "announcements" && (
        <AnnouncementManager 
          currentUser={currentUser}
          allEmployees={unfilteredEmployees || []}
          isAdmin={isAdmin}
        />
      )}
      
      {activeTab === "messages" && (
        <EmployeeCommunications />
      )}
    </>
  );
});

CommunicationContent.displayName = "CommunicationContent";
