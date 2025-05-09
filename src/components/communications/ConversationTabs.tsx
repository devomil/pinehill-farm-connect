import React, { useState, useCallback } from "react";
import { EmployeeListView } from "./EmployeeListView";
import { ConversationView } from "./ConversationView";
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
        <ConversationView
          messages={messages}
          loading={loading}
          selectedEmployee={selectedEmployee}
          onRespond={onRespond}
          onSendMessage={onSendMessage}
          currentUser={null} // TODO: Remove this prop
        />
      </div>
    </div>
  );
};
