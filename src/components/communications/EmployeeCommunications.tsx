
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useCommunications } from "@/hooks/useCommunications";
import { NewMessageDialog } from "./NewMessageDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { EmployeeList } from "./EmployeeList";
import { MessageConversation } from "./MessageConversation";
import { supabase } from "@/integrations/supabase/client";

export function EmployeeCommunications() {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployeeDirectory();
  const { assignments } = useEmployeeAssignments();
  const { messages, isLoading, sendMessage, respondToShiftRequest, unreadMessages } = useCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (selectedEmployee && currentUser && unreadMessages.length > 0) {
        // Find unread messages from the selected employee
        const toMarkAsRead = unreadMessages.filter(
          msg => msg.sender_id === selectedEmployee.id && msg.recipient_id === currentUser.id
        );
        
        if (toMarkAsRead.length > 0) {
          console.log(`Marking ${toMarkAsRead.length} messages as read`);
          
          const messageIds = toMarkAsRead.map(msg => msg.id);
          const { error } = await supabase
            .from('employee_communications')
            .update({ read_at: new Date().toISOString() })
            .in('id', messageIds);
          
          if (error) {
            console.error("Error marking messages as read:", error);
          }
        }
      }
    };
    
    markMessagesAsRead();
  }, [selectedEmployee, currentUser, unreadMessages]);

  const handleSendMessage = (message: string) => {
    if (selectedEmployee) {
      sendMessage({
        recipientId: selectedEmployee.id,
        message: message,
        type: "general",
      });
    }
  };

  const handleSelectEmployee = useCallback((employee: User) => {
    setSelectedEmployee(employee);
  }, []);

  const handleNewMessageSend = (data: any) => {
    sendMessage(data);
    setDialogOpen(false);
    
    // Find and select the employee that received the message
    if (allEmployees) {
      const recipient = allEmployees.find(emp => emp.id === data.recipientId);
      if (recipient) {
        setSelectedEmployee(recipient);
      }
    }
  };
  
  // Show mobile layout or desktop layout based on screen size and selection
  const showMessageList = !isMobileView || (isMobileView && !selectedEmployee);
  const showConversation = !isMobileView || (isMobileView && selectedEmployee);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>Direct messages</span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Message</Button>
          </DialogTrigger>
          <NewMessageDialog
            employees={allEmployees || []}
            onSend={handleNewMessageSend}
            onClose={() => setDialogOpen(false)}
          />
        </Dialog>
      </div>

      {allEmployees?.length <= 1 && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-800" />
          <AlertDescription className="text-amber-800">
            You can only see yourself in the employee list. This is likely due to a database permission issue or because no other employees have been created yet. Try clicking "Fix Assignments" in the Reports page.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Employee List Column */}
        {showMessageList && (
          <Card className="md:col-span-1 p-4">
            <EmployeeList
              employees={allEmployees || []}
              isLoading={isLoading || employeesLoading}
              onSelectEmployee={handleSelectEmployee}
              selectedEmployee={selectedEmployee}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              unreadMessages={unreadMessages}
            />
          </Card>
        )}

        {/* Conversation Column */}
        {showConversation && (
          <Card className="md:col-span-2">
            <MessageConversation
              selectedEmployee={selectedEmployee}
              messages={messages || []}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedEmployee(null)}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
