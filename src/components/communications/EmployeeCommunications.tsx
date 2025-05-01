
import React, { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { EmployeeList } from "./EmployeeList";
import { MessageConversation } from "./MessageConversation";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeAlert } from "./EmployeeAlert";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: (employee: User | null) => void;
}

export function EmployeeCommunications({ 
  selectedEmployee: propSelectedEmployee, 
  setSelectedEmployee: propSetSelectedEmployee 
}: EmployeeCommunicationsProps = {}) {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading, refetch: refetchEmployees } = useEmployeeDirectory();
  const { assignments } = useEmployeeAssignments();
  const { messages, isLoading, sendMessage, respondToShiftRequest, unreadMessages, refreshMessages } = useCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Sync with parent component if props are provided
  useEffect(() => {
    if (propSelectedEmployee !== undefined) {
      setSelectedEmployee(propSelectedEmployee);
    }
  }, [propSelectedEmployee]);

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

  // Enhanced type correction to properly cast all messages and their nested properties
  const typedMessages = React.useMemo(() => {
    if (!messages) return [] as Communication[];
    
    return messages.map(msg => {
      // Cast message type to proper union type
      const messageType = ['general', 'shift_coverage', 'urgent'].includes(msg.type) 
        ? msg.type as 'general' | 'shift_coverage' | 'urgent'
        : 'general' as const;
      
      // Cast message status to proper union type
      const messageStatus = ['pending', 'accepted', 'declined'].includes(msg.status)
        ? msg.status as 'pending' | 'accepted' | 'declined'
        : 'pending' as const;
      
      // Process shift coverage requests to ensure they have proper types
      const typedShiftRequests = msg.shift_coverage_requests?.map(req => {
        return {
          ...req,
          status: ['pending', 'accepted', 'declined'].includes(req.status)
            ? req.status as 'pending' | 'accepted' | 'declined'
            : 'pending' as const
        };
      });
      
      // Build the properly typed message object
      return {
        ...msg,
        type: messageType,
        status: messageStatus,
        shift_coverage_requests: typedShiftRequests,
      } as Communication;
    });
  }, [messages]);

  const handleSendMessage = useCallback((message: string) => {
    if (selectedEmployee) {
      sendMessage({
        recipientId: selectedEmployee.id,
        message: message,
        type: "general",
      });
    }
  }, [selectedEmployee, sendMessage]);

  const handleSelectEmployee = useCallback((employee: User) => {
    setSelectedEmployee(employee);
    // Update parent component if callback provided
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  }, [propSetSelectedEmployee]);

  const handleNewMessageSend = useCallback((data: any) => {
    sendMessage(data);
    setDialogOpen(false);
    
    // Find and select the employee that received the message
    if (allEmployees) {
      const recipient = allEmployees.find(emp => emp.id === data.recipientId);
      if (recipient) {
        handleSelectEmployee(recipient);
      }
    }
  }, [sendMessage, allEmployees, handleSelectEmployee]);
  
  // Combined refresh function
  const handleRefresh = useCallback(() => {
    console.log("Refreshing employee data and messages");
    refetchEmployees();
    refreshMessages();
  }, [refetchEmployees, refreshMessages]);
  
  // Show mobile layout or desktop layout based on screen size and selection
  const showMessageList = !isMobileView || (isMobileView && !selectedEmployee);
  const showConversation = !isMobileView || (isMobileView && selectedEmployee);

  return (
    <div className="space-y-4">
      <EmployeeCommunicationsHeader 
        setDialogOpen={setDialogOpen}
        dialogOpen={dialogOpen}
        handleNewMessageSend={handleNewMessageSend}
        allEmployees={allEmployees || []}
        onRefresh={handleRefresh}
      />

      {allEmployees?.length <= 1 && <EmployeeAlert />}

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
              onRefresh={handleRefresh}
            />
          </Card>
        )}

        {/* Conversation Column */}
        {showConversation && (
          <Card className="md:col-span-2">
            <MessageConversation
              selectedEmployee={selectedEmployee}
              messages={typedMessages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onBack={() => {
                setSelectedEmployee(null);
                if (propSetSelectedEmployee) {
                  propSetSelectedEmployee(null);
                }
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
