
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";

// Add interface for enhanced communications with UI properties
interface EnhancedCommunication extends Communication {
  sender_name?: string;
}

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
    ? [...new Set(unreadMessages.map(msg => msg.sender_id))]
    : [];
  
  // Get the names of up to 2 senders to display
  const getSenderNamesPreview = (): string => {
    if (!unreadMessages || unreadMessages.length === 0) return "";
    
    // Extract unique sender names (if available in the message objects)
    const uniqueSenderNames = [...new Set(unreadMessages
      .map(msg => (msg as EnhancedCommunication).sender_name || "Unknown")
      .filter(name => name !== "Unknown")
    )];
    
    if (uniqueSenderNames.length === 0) return "";
    if (uniqueSenderNames.length === 1) return `from ${uniqueSenderNames[0]}`;
    if (uniqueSenderNames.length === 2) return `from ${uniqueSenderNames[0]} and ${uniqueSenderNames[1]}`;
    
    return `from ${uniqueSenderNames[0]}, ${uniqueSenderNames[1]}, and others`;
  };

  const senderNamesPreview = getSenderNamesPreview();

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
              {uniqueSenders.length > 0 && (
                <span className="ml-1 text-xs">
                  {uniqueSenders.length === 1 
                    ? " from 1 person" 
                    : ` from ${uniqueSenders.length} people`}
                </span>
              )}
            </div>
          )}
        </TabsTrigger>
      </TabsList>
      
      {/* Show sender names preview if there are unread messages */}
      {activeTab === "messages" && unreadMessages && unreadMessages.length > 0 && senderNamesPreview && (
        <div className="mb-4 text-sm text-primary flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          <span>New messages {senderNamesPreview}</span>
        </div>
      )}
      
      <TabsContent value="announcements">
        {children[0]}
      </TabsContent>
      
      <TabsContent value="messages">
        {children[1]}
      </TabsContent>
    </Tabs>
  );
};
