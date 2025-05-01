
import { useState, useCallback } from "react";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { User } from "@/types";
import { useMessageReadStatus } from "./useMessageReadStatus";
import { useProcessMessages } from "./useProcessMessages";
import { useResponsiveLayout } from "./useResponsiveLayout";
import { useMessageSending } from "./useMessageSending";
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
  const { messages: rawMessages, isLoading, sendMessage, respondToShiftRequest, unreadMessages: rawUnreadMessages, refreshMessages } = useCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use our extracted hooks
  const { isMobileView } = useResponsiveLayout();
  
  // Process messages with proper typing
  const processedMessages: Communication[] = useProcessMessages(rawMessages, currentUser);
  
  // Process unread messages to ensure proper typing
  const typedUnreadMessages: Communication[] = useProcessMessages(rawUnreadMessages, currentUser);
  
  // Use message read status hook with properly typed unread messages
  useMessageReadStatus(selectedEmployee, currentUser, typedUnreadMessages);

  // Handle employee selection with sync to parent component if needed
  const handleSelectEmployee = useCallback((employee: User) => {
    setSelectedEmployee(employee);
    // Update parent component if callback provided
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  }, [propSetSelectedEmployee]);

  // Use message sending hook
  const { handleSendMessage, handleNewMessageSend } = useMessageSending(
    selectedEmployee, 
    currentUser, 
    sendMessage, 
    handleSelectEmployee,
    allEmployees
  );
  
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
    unreadMessages: typedUnreadMessages,
    processedMessages,
    isMobileView,
    setSelectedEmployee: handleSelectEmployee
  };
}
