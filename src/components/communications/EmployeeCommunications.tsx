
import React from "react";
import { Card } from "@/components/ui/card";
import { User } from "@/types";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeAlert } from "./EmployeeAlert";
import { EmployeeListView } from "./EmployeeListView";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { useEmployeeCommunications } from "@/hooks/communications/useEmployeeCommunications";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: (employee: User | null) => void;
}

export function EmployeeCommunications({ 
  selectedEmployee: propSelectedEmployee, 
  setSelectedEmployee: propSetSelectedEmployee 
}: EmployeeCommunicationsProps = {}) {
  const {
    allEmployees,
    isLoading,
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
    setSelectedEmployee
  } = useEmployeeCommunications({
    selectedEmployee: propSelectedEmployee,
    setSelectedEmployee: propSetSelectedEmployee
  });
  
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
          <EmployeeListView
            employees={allEmployees || []}
            isLoading={isLoading}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessages={unreadMessages}
            onRefresh={handleRefresh}
          />
        )}

        {/* Conversation Column */}
        {showConversation && (
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={processedMessages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onBack={() => {
              setSelectedEmployee(null);
              if (propSetSelectedEmployee) {
                propSetSelectedEmployee(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
