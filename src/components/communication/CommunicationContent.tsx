
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

export const CommunicationContent: React.FC<CommunicationContentProps> = ({
  activeTab,
  currentUser,
  unfilteredEmployees,
  isAdmin
}) => {
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
};
