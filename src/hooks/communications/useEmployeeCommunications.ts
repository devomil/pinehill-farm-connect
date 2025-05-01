
import { useState, useCallback, useEffect, useMemo } from "react";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Communication, MessageType } from "@/types/communications/communicationTypes";

interface UseEmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: (employee: User | null) => void;
}

export interface SendMessageData {
  recipientId: string;
  message: string;
  type: MessageType;
  shiftDetails?: {
    shift_date: string;
    shift_start: string;
    shift_end: string;
  };
}

export function useEmployeeCommunications({
  selectedEmployee: propSelectedEmployee,
  setSelectedEmployee: propSetSelectedEmployee
}: UseEmployeeCommunicationsProps = {}) {
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
      if (!selectedEmployee || !currentUser || !unreadMessages.length) return;

      // Find unread messages from the selected employee
      const toMarkAsRead = unreadMessages.filter(
        msg => msg.sender_id === selectedEmployee.id && msg.recipient_id === currentUser.id
      );
      
      if (toMarkAsRead.length === 0) return;
      
      console.log(`Marking ${toMarkAsRead.length} messages as read`);
      
      const messageIds = toMarkAsRead.map(msg => msg.id);
      const { error } = await supabase
        .from('employee_communications')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
      
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    };
    
    markMessagesAsRead();
  }, [selectedEmployee, currentUser, unreadMessages]);

  // Process messages with proper typing
  const processedMessages = useMemo((): Communication[] => {
    if (!messages || !messages.length) return [];
    
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
      const typedShiftRequests = msg.shift_coverage_requests?.map((req: any) => {
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
        admin_cc: msg.admin_cc
      } as Communication;
    });
  }, [messages]);

  const handleSendMessage = useCallback((message: string) => {
    if (!selectedEmployee) return;
    
    sendMessage({
      recipientId: selectedEmployee.id,
      message,
      type: "general",
    });
  }, [selectedEmployee, sendMessage]);

  const handleSelectEmployee = useCallback((employee: User) => {
    setSelectedEmployee(employee);
    // Update parent component if callback provided
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  }, [propSetSelectedEmployee]);

  const handleNewMessageSend = useCallback((data: SendMessageData) => {
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

  return {
    currentUser,
    allEmployees,
    isLoading: isLoading || employeesLoading,
    selectedEmployee,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    handleSelectEmployee,
    handleSendMessage,
    handleNewMessageSend,
    handleRefresh,
    unreadMessages,
    processedMessages,
    isMobileView,
    setSelectedEmployee: handleSelectEmployee
  };
}
