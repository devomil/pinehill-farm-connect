
import React from "react";
import { Card } from "@/components/ui/card";
import { User } from "@/types";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeAlert } from "./EmployeeAlert";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { useEmployeeCommunications } from "@/hooks/communications/useEmployeeCommunications";
import { Communication } from "@/types/communications/communicationTypes";

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

      <div className="space-y-4">
        {/* Employee Dropdown Selection */}
        <Card className="p-4">
          <EmployeeDropdownSelect
            employees={allEmployees || []}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessages={unreadMessages || []}
          />
        </Card>

        {/* Conversation View */}
        {selectedEmployee && (
          <Card className="md:col-span-2 p-4">
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
          </Card>
        )}
      </div>
    </div>
  );
}
