
import React, { memo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

export const CommunicationTabs = memo<CommunicationTabsProps>(({
  activeTab,
  unreadMessages,
  onTabChange
}) => {
  console.log("CommunicationTabs rendering, active tab:", activeTab);
  
  // Filter direct messages only (explicitly include only direct message types)
  // and ensure only truly unread messages are counted
  const filteredUnreadMessages = unreadMessages 
    ? unreadMessages.filter(msg => 
        (msg.type === 'general' || 
        msg.type === 'shift_coverage' || 
        msg.type === 'urgent') &&
        msg.read_at === null)
    : [];
    
  // Group unread messages by sender for better visibility
  const uniqueSenders = filteredUnreadMessages.length > 0
    ? [...new Set(filteredUnreadMessages.map(msg => msg.sender_id))]
    : [];
  
  // Get the names of up to 2 senders to display
  const getSenderNamesPreview = useCallback((): string => {
    if (!filteredUnreadMessages || filteredUnreadMessages.length === 0) return "";
    
    // Extract unique sender names (if available in the message objects)
    const uniqueSenderNames = [...new Set(filteredUnreadMessages
      .map(msg => (msg as EnhancedCommunication).sender_name || "Unknown")
      .filter(name => name !== "Unknown")
    )];
    
    if (uniqueSenderNames.length === 0) return "";
    if (uniqueSenderNames.length === 1) return `from ${uniqueSenderNames[0]}`;
    if (uniqueSenderNames.length === 2) return `from ${uniqueSenderNames[0]} and ${uniqueSenderNames[1]}`;
    
    return `from ${uniqueSenderNames[0]}, ${uniqueSenderNames[1]}, and others`;
  }, [filteredUnreadMessages]);

  const senderNamesPreview = getSenderNamesPreview();

  // Memoized tab change handler to prevent rerenders
  const handleTabChange = useCallback((value: string) => {
    if (value !== activeTab) {
      console.log(`Tab change from ${activeTab} to ${value}`);
      onTabChange(value);
    }
  }, [activeTab, onTabChange]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6" defaultValue={activeTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="announcements" data-testid="announcements-tab">
          Company Announcements
        </TabsTrigger>
        <TabsTrigger value="messages" data-testid="messages-tab" className="relative">
          Direct Messages
          {filteredUnreadMessages.length > 0 && (
            <div className="ml-2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {filteredUnreadMessages.length}
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
      {activeTab === "messages" && filteredUnreadMessages.length > 0 && senderNamesPreview && (
        <div className="mb-4 text-sm text-primary flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          <span>New messages {senderNamesPreview}</span>
        </div>
      )}
    </Tabs>
  );
});

CommunicationTabs.displayName = "CommunicationTabs";
