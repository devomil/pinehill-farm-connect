
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
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
}

export const ConversationTabs: React.FC<ConversationTabsProps> = ({
  messages,
  loading,
  unreadMessages,
  employees,
  onRespond,
  onSendMessage,
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
            <EmployeeCommunications
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
