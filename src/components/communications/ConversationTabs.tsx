
import React, { useState, useCallback } from "react";
import { EmployeeListView } from "./EmployeeListView";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface ConversationTabsProps {
  messages: Communication[];
  loading: boolean;
  unreadMessages: Communication[];
  employees: User[];
  onRespond: (messageId: string, response: string) => void;
  onSendMessage: (data: any) => void;
  onRefresh: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ConversationTabs: React.FC<ConversationTabsProps> = ({
  messages,
  loading,
  unreadMessages,
  employees,
  onRespond,
  onSendMessage,
  onRefresh,
  searchQuery = "",
  onSearchChange
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const handleEmployeeSelect = useCallback((employee: User) => {
    setSelectedEmployee(employee);
  }, []);
  
  // Make sure we're properly handling search changes
  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      console.log("ConversationTabs - propagating search change:", query);
      onSearchChange(query);
    }
  };

  // Filter messages for selected employee
  const employeeMessages = selectedEmployee
    ? messages.filter(
        (msg) => 
          msg.sender?.id === selectedEmployee.id || 
          msg.recipient?.id === selectedEmployee.id
      )
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Employee list view */}
      <EmployeeListView
        employees={employees}
        loading={loading}
        onSelectEmployee={handleEmployeeSelect}
        selectedEmployee={selectedEmployee}
        onRefresh={onRefresh}
        messages={messages}
        unreadMessages={unreadMessages}
        error={null}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
      />

      {/* Conversation view */}
      <div className="md:col-span-2">
        {selectedEmployee ? (
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={employeeMessages}
            loading={loading}
            onSendMessage={(message) => onSendMessage({
              recipientId: selectedEmployee.id,
              message,
              type: 'general'
            })}
            onRefresh={onRefresh}
            unreadMessages={unreadMessages}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-6 bg-slate-50 rounded-lg">
            <p className="text-slate-500 text-center">
              Select an employee to view or start a conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
