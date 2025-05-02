
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Mail, RefreshCcw } from "lucide-react";
import { MessageList } from "@/components/communications/MessageList";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { NewMessageDialog } from "@/components/communications/NewMessageDialog";
import { User } from "@/types";

interface ConversationTabsProps {
  messages: any[];
  loading: boolean;
  unreadMessages: any[];
  employees: User[];
  onRespond: (data: { communicationId: string; shiftRequestId: string; accept: boolean; senderId: string }) => void;
  onSendMessage: (data: any) => void;
  onRefresh?: () => void; // Add refresh handler
}

export const ConversationTabs: React.FC<ConversationTabsProps> = ({
  messages,
  loading,
  unreadMessages,
  employees,
  onRespond,
  onSendMessage,
  onRefresh
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const handleNewMessageSend = (data: any) => {
    onSendMessage(data);
    setDialogOpen(false);
  };

  const handleViewConversation = (employee: User) => {
    setSelectedEmployee(employee);
    setActiveTab("conversation");
  };

  const messagesWithCurrentUser = React.useMemo(() => {
    return messages.map(msg => ({
      ...msg,
      current_user_id: msg.current_user_id
    }));
  }, [messages]);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="inbox">
              Inbox
              {unreadMessages.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}
            </TabsTrigger>
            {selectedEmployee && (
              <TabsTrigger value="conversation">
                Conversation with {selectedEmployee.name}
              </TabsTrigger>
            )}
          </TabsList>
          
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <NewMessageDialog
                employees={employees || []}
                onSend={handleNewMessageSend}
                onClose={() => setDialogOpen(false)}
              />
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="inbox">
          <Card className="p-4">
            <MessageList
              messages={messagesWithCurrentUser}
              isLoading={loading}
              onRespond={onRespond}
              employees={employees || []}
              onViewConversation={handleViewConversation}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="conversation">
          <Card className="p-4">
            {/* Pass selectedEmployee and setSelectedEmployee as props */}
            <EmployeeCommunications />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
