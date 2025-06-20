
import React from 'react';
import ErrorBoundary from "@/components/debug/ErrorBoundary";
import { CommunicationTabs } from "./CommunicationPageTabs";
import { CommunicationContent } from "./CommunicationContent";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface CommunicationPageContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages: Communication[];
  currentUser: User | null;
  unfilteredEmployees: User[];
  isAdmin: boolean;
}

export const CommunicationPageContent: React.FC<CommunicationPageContentProps> = ({
  activeTab,
  onTabChange,
  unreadMessages,
  currentUser,
  unfilteredEmployees,
  isAdmin
}) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <ErrorBoundary componentName="CommunicationTabs">
        <CommunicationTabs 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          unreadMessages={unreadMessages}
        />
      </ErrorBoundary>
      
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary componentName="CommunicationContent">
          <CommunicationContent
            activeTab={activeTab}
            currentUser={currentUser}
            unfilteredEmployees={unfilteredEmployees || []}
            isAdmin={isAdmin}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
