
import React from "react";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { User } from "@/types";
import { EmployeeCommunicationError } from "./EmployeeCommunicationError";
import { EmployeeCommunicationMobile } from "./EmployeeCommunicationMobile";
import { EmployeeCommunicationDesktop } from "./EmployeeCommunicationDesktop";
import { useEmployeeCommunicationsData } from "@/hooks/communications/useEmployeeCommunications.hooks";
import { useDebug } from "@/hooks/useDebug";
import { MessageDebugger } from "@/components/debug/MessageDebugger";
import { RouteDebugger } from "@/components/debug/RouteDebugger";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const debug = useDebug('EmployeeCommunications', {
    trackRenders: true,
    logStateChanges: true
  });
  
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
    unreadMessages,
    filteredMessages
  } = useEmployeeCommunicationsData(
    propSelectedEmployee, 
    propSetSelectedEmployee,
    propsOnRefresh,
    retryCount
  );
  
  // Log initial component state
  debug.log('EmployeeCommunications rendering', {
    isMobileView,
    hasSelectedEmployee: !!selectedEmployee,
    employeesLoading,
    messagesLoading,
    messagesCount: processedMessages?.length,
    filteredCount: filteredMessages?.length,
    hasError: !!error,
    currentUrl: location.pathname + location.search
  });

  // Show error message if there's an issue
  if (error && !loading) {
    return (
      <>
        <RouteDebugger />
        <MessageDebugger 
          selectedEmployee={selectedEmployee}
          messages={processedMessages || []}
          filteredMessages={filteredMessages || []}
          currentUser={currentUser}
          isLoading={loading}
          error={error}
        />
        <EmployeeCommunicationError
          error={error}
          retryCount={retryCount}
          onRefresh={handleRefresh}
        />
      </>
    );
  }

  // For mobile layout, show either conversations list or specific conversation
  if (isMobileView) {
    return (
      <>
        <RouteDebugger />
        {showDebugInfo && (
          <MessageDebugger 
            selectedEmployee={selectedEmployee}
            messages={processedMessages || []}
            filteredMessages={filteredMessages || []}
            currentUser={currentUser}
            isLoading={loading}
            navigationState={{
              activeTab: new URLSearchParams(location.search).get('tab') || '',
            }}
          />
        )}
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
      </>
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <>
      <RouteDebugger />
      {showDebugInfo && (
        <MessageDebugger 
          selectedEmployee={selectedEmployee}
          messages={processedMessages || []}
          filteredMessages={filteredMessages || []}
          currentUser={currentUser}
          isLoading={loading}
          navigationState={{
            activeTab: new URLSearchParams(location.search).get('tab') || '',
          }}
        />
      )}
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
    </>
  );
};
