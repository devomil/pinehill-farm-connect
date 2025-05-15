
import React, { useState } from "react";
import { User } from "@/types";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { Communication } from "@/types/communications/communicationTypes";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeCommunicationDebug } from "./EmployeeCommunicationDebug";
import { useConversationContext } from "@/hooks/communications/useConversationContext";
import { EmptyConversation } from "./conversation/EmptyConversation";

interface EmployeeCommunicationDesktopProps {
  selectedEmployee: User | null;
  processedMessages: Communication[];
  loading: boolean;
  unfilteredEmployees: User[];
  showDebugInfo: boolean;
  setShowDebugInfo: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectEmployee: (employee: User) => void;
  sendMessage: (params: any) => Promise<any>;
  handleRefresh: () => void;
  error: any;
  employeesLoading: boolean;
  messagesLoading: boolean;
  currentUser: User | null;
  unreadMessages?: Communication[];
}

export function EmployeeCommunicationDesktop({
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
  unreadMessages = []
}: EmployeeCommunicationDesktopProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { filteredMessages, conversationPartners, createMessageSender } = useConversationContext(
    selectedEmployee,
    processedMessages,
    currentUser,
    unfilteredEmployees
  );

  // Handle sending message to selected employee
  const handleSendMessage = createMessageSender(selectedEmployee, currentUser, sendMessage);

  return (
    <div className="space-y-4">
      <EmployeeCommunicationsHeader 
        onRefresh={handleRefresh}
        title="Direct Messages"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <EmployeeDropdownSelect
            employees={unfilteredEmployees}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessages={unreadMessages}
            recentConversations={conversationPartners}
          />
        </div>
        
        <div className="md:col-span-2">
          {selectedEmployee ? (
            <EmployeeConversationView
              selectedEmployee={selectedEmployee}
              messages={filteredMessages}
              loading={loading}
              onSendMessage={handleSendMessage}
              onRefresh={handleRefresh}
              unreadMessages={unreadMessages}
            />
          ) : (
            <div className="border rounded-md p-6 flex items-center justify-center h-[70vh] bg-muted/30">
              <p className="text-muted-foreground">
                Select an employee to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>
      
      {showDebugInfo && (
        <EmployeeCommunicationDebug
          showDebugInfo={showDebugInfo}
          setShowDebugInfo={setShowDebugInfo}
          employeesCount={unfilteredEmployees.length}
          messagesCount={processedMessages.length}
          selectedEmployee={selectedEmployee}
          filteredCount={filteredMessages.length}
          loading={loading}
          error={error}
          employeesLoading={employeesLoading}
          messagesLoading={messagesLoading}
        />
      )}
    </div>
  );
}
