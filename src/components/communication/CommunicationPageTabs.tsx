
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";

interface CommunicationTabsProps {
  activeTab: string;
  unreadMessages: Communication[] | null;
  onTabChange: (value: string) => void;
  children: [React.ReactNode, React.ReactNode]; // Expects exactly two children: AnnouncementManager and EmployeeCommunications
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  activeTab,
  unreadMessages,
  onTabChange,
  children
}) => {
  // Group unread messages by sender for better visibility
  const uniqueSenders = unreadMessages 
    ? [...new Set(unreadMessages.map(msg => msg.sender_id))].length
    : 0;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="announcements">Company Announcements</TabsTrigger>
        <TabsTrigger value="messages" className="relative">
          Direct Messages
          {unreadMessages && unreadMessages.length > 0 && (
            <div className="ml-2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {unreadMessages.length}
              {uniqueSenders > 1 && (
                <span className="ml-1 text-xs">from {uniqueSenders} people</span>
              )}
            </div>
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
