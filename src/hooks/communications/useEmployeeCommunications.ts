
import { useState, useCallback, useMemo } from "react";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { User } from "@/types";
import { useMessageReadStatus } from "./useMessageReadStatus";
import { useProcessMessages } from "./useProcessMessages";
import { useResponsiveLayout } from "./useResponsiveLayout";
import { useMessageSending } from "./useMessageSending";
import { useRecentCommunications } from "./useRecentCommunications";
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
  
  // Get recent conversations
  const recentConversations = useRecentCommunications(
    processedMessages, 
    currentUser?.id,
    allEmployees || [],
    7 // Last 7 days
  );

  // Find Jackie's user record for CC
  const jackieUser = useMemo(() => {
    return allEmployees?.find(emp => emp.email === 'jackie@pinehillfarm.co') || null;
  }, [allEmployees]);

  // Get pending shift coverage requests
  const pendingShiftRequests = useMemo(() => {
    return processedMessages.filter(message => 
      message.type === 'shift_coverage' && 
      message.status === 'pending' && 
      (message.recipient_id === currentUser?.id || message.sender_id === currentUser?.id)
    );
  }, [processedMessages, currentUser]);
  
  // Use message read status hook with properly typed unread messages
  useMessageReadStatus(selectedEmployee, currentUser, typedUnreadMessages);

  // Handle employee selection with sync to parent component if needed
  const handleSelectEmployee = useCallback((employee: User | null) => {
    setSelectedEmployee(employee);
    // Update parent component if callback provided
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  }, [propSetSelectedEmployee]);

  // Enhanced message sending hook with Jackie CC support
  const { handleSendMessage, handleNewMessageSend } = useMessageSending(
    selectedEmployee, 
    currentUser, 
    (params) => {
      // For shift coverage requests, always CC Jackie by including her ID
      if (params.type === 'shift_coverage' && jackieUser) {
        console.log(`Adding Jackie (${jackieUser.id}) as CC for shift coverage request`);
        // Clone the params to avoid modifying the original
        const enhancedParams = { ...params };
        // Add Jackie's ID for the backend to handle CC'ing
        enhancedParams.adminCc = jackieUser.id;
        return sendMessage(enhancedParams);
      } else {
        // For regular messages, proceed as normal
        return sendMessage(params);
      }
    }, 
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
    setSelectedEmployee: handleSelectEmployee,
    recentConversations,
    pendingShiftRequests
  };
}
