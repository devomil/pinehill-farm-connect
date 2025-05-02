
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommunicationTabsProps {
  activeTab: string;
  unreadMessages: any[] | null;
  onTabChange: (value: string) => void;
  children: [React.ReactNode, React.ReactNode]; // Expects exactly two children: AnnouncementManager and EmployeeCommunications
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  activeTab,
  unreadMessages,
  onTabChange,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="announcements">Company Announcements</TabsTrigger>
        <TabsTrigger value="messages">
          Direct Messages
          {unreadMessages && unreadMessages.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {unreadMessages.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="announcements">
        {children[0]}
      </TabsContent>
      
      <TabsContent value="messages">
        {children[1]}
      </TabsContent>
    </Tabs>
  );
};
