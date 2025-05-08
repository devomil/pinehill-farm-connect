
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { toast } from "sonner";
import { EmployeeCommunicationError } from "./EmployeeCommunicationError";
import { EmployeeCommunicationMobile } from "./EmployeeCommunicationMobile";
import { EmployeeCommunicationDesktop } from "./EmployeeCommunicationDesktop";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: React.Dispatch<React.SetStateAction<User | null>>;
  onRefresh?: () => void;
  retryCount?: number;
}

export const EmployeeCommunications: React.FC<EmployeeCommunicationsProps> = ({ 
  selectedEmployee: propSelectedEmployee,
  setSelectedEmployee: propSetSelectedEmployee,
  onRefresh: propsOnRefresh,
  retryCount = 0
}) => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees, loading: employeesLoading, error: employeeError, refetch: refetchEmployees } = useEmployeeDirectory();
  // Exclude shift coverage messages from employee communications
  const { messages, isLoading: messagesLoading, sendMessage, refreshMessages, error: messagesError, unreadMessages } = useCommunications(true);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const { isMobileView } = useResponsiveLayout();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const processedMessages = useProcessMessages(messages, currentUser);
  const loading = employeesLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      console.log(`Retrying employee fetch due to retryCount: ${retryCount}`);
      refetchEmployees();
      refreshMessages();
    }
  }, [retryCount, refetchEmployees, refreshMessages]);

  // Log debugging information
  useEffect(() => {
    console.log("EmployeeCommunications - employeesLoading:", employeesLoading);
    console.log("EmployeeCommunications - messagesLoading:", messagesLoading);
    console.log("EmployeeCommunications - unfilteredEmployees count:", unfilteredEmployees?.length || 0);
    console.log("EmployeeCommunications - processedMessages count:", processedMessages?.length || 0);
    console.log("EmployeeCommunications - employeeError:", employeeError ? 
      (typeof employeeError === 'string' ? employeeError : employeeError.message || 'Unknown error') : 'None');
    console.log("EmployeeCommunications - messagesError:", messagesError ? 
      (typeof messagesError === 'string' ? messagesError : messagesError.message || 'Unknown error') : 'None');
    
    // When component mounts, ensure we have fresh employee data
    if (!unfilteredEmployees || unfilteredEmployees.length === 0) {
      console.log("No employees found, fetching fresh data");
      refetchEmployees();
    }
  }, [employeesLoading, messagesLoading, unfilteredEmployees, processedMessages, employeeError, messagesError, refetchEmployees]);
  
  const handleSelectEmployee = (employee: User) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing employee data and messages");
    refetchEmployees();
    refreshMessages();
    
    // Also call parent's onRefresh if provided
    if (propsOnRefresh) {
      propsOnRefresh();
    }
  };

  // Show error message if there's an issue
  if (error && !loading) {
    return (
      <EmployeeCommunicationError
        error={error}
        retryCount={retryCount}
        onRefresh={handleRefresh}
      />
    );
  }

  // For mobile layout, show either conversations list or specific conversation
  if (isMobileView) {
    return (
      <EmployeeCommunicationMobile
        selectedEmployee={selectedEmployee}
        processedMessages={processedMessages}
        loading={loading}
        unfilteredEmployees={unfilteredEmployees || []}
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
        handleSelectEmployee={handleSelectEmployee}
        sendMessage={sendMessage}
        handleRefresh={handleRefresh}
        error={error}
        employeesLoading={employeesLoading}
        messagesLoading={messagesLoading}
        currentUser={currentUser}
        unreadMessages={unreadMessages || []}
      />
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <EmployeeCommunicationDesktop
      selectedEmployee={selectedEmployee}
      processedMessages={processedMessages}
      loading={loading}
      unfilteredEmployees={unfilteredEmployees || []}
      showDebugInfo={showDebugInfo}
      setShowDebugInfo={setShowDebugInfo}
      handleSelectEmployee={handleSelectEmployee}
      sendMessage={sendMessage}
      handleRefresh={handleRefresh}
      error={error}
      employeesLoading={employeesLoading}
      messagesLoading={messagesLoading}
      currentUser={currentUser}
      unreadMessages={unreadMessages || []}
    />
  );
};
