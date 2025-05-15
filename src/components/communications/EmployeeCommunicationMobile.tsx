
import React, { useState } from "react";
import { User } from "@/types";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { Communication } from "@/types/communications/communicationTypes";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeCommunicationDebug } from "./EmployeeCommunicationDebug";
import { useConversationContext } from "@/hooks/communications/useConversationContext";

interface EmployeeCommunicationMobileProps {
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

export function EmployeeCommunicationMobile({
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
}: EmployeeCommunicationMobileProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { filteredMessages, conversationPartners, createMessageSender } = useConversationContext(
    selectedEmployee,
    processedMessages,
    currentUser,
    unfilteredEmployees
  );

  // Handle sending message to selected employee
  const handleSendMessage = createMessageSender(selectedEmployee, currentUser, sendMessage);

  // Clear selected employee
  const handleBack = () => {
    handleSelectEmployee(null as unknown as User);
  };

  return (
    <div className="space-y-4">
      {selectedEmployee ? (
        <>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <EmployeeCommunicationsHeader
              onRefresh={handleRefresh}
              title=""
            />
          </div>
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={filteredMessages}
            loading={loading}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            onRefresh={handleRefresh}
            unreadMessages={unreadMessages}
          />
        </>
      ) : (
        <>
          <EmployeeCommunicationsHeader
            onRefresh={handleRefresh}
            title="Direct Messages"
          />
          <EmployeeDropdownSelect
            employees={unfilteredEmployees}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessages={unreadMessages}
            recentConversations={conversationPartners}
          />
        </>
      )}
      
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
