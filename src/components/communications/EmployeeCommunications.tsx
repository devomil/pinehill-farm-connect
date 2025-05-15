
import React from "react";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { User } from "@/types";
import { EmployeeCommunicationError } from "./EmployeeCommunicationError";
import { EmployeeCommunicationMobile } from "./EmployeeCommunicationMobile";
import { EmployeeCommunicationDesktop } from "./EmployeeCommunicationDesktop";
import { useEmployeeCommunicationsData } from "@/hooks/communications/useEmployeeCommunications.hooks";

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
  const { isMobileView } = useResponsiveLayout();
  
  // Use our custom hook to handle all the data logic
  const {
    selectedEmployee,
    processedMessages,
    loading,
    unfilteredEmployees,
    showDebugInfo,
    setShowDebugInfo,
    handleSelectEmployee,
    sendMessage,
    handleRefresh,
    error,
    employeesLoading,
    messagesLoading,
    currentUser,
    unreadMessages
  } = useEmployeeCommunicationsData(
    propSelectedEmployee, 
    propSetSelectedEmployee,
    propsOnRefresh,
    retryCount
  );

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
        unfilteredEmployees={unfilteredEmployees}
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
        handleSelectEmployee={handleSelectEmployee}
        sendMessage={sendMessage}
        handleRefresh={handleRefresh}
        error={error}
        employeesLoading={employeesLoading}
        messagesLoading={messagesLoading}
        currentUser={currentUser}
        unreadMessages={unreadMessages}
      />
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <EmployeeCommunicationDesktop
      selectedEmployee={selectedEmployee}
      processedMessages={processedMessages}
      loading={loading}
      unfilteredEmployees={unfilteredEmployees}
      showDebugInfo={showDebugInfo}
      setShowDebugInfo={setShowDebugInfo}
      handleSelectEmployee={handleSelectEmployee}
      sendMessage={sendMessage}
      handleRefresh={handleRefresh}
      error={error}
      employeesLoading={employeesLoading}
      messagesLoading={messagesLoading}
      currentUser={currentUser}
      unreadMessages={unreadMessages}
    />
  );
};
