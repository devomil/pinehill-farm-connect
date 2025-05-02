
import React, { useState } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { EmployeeListView } from "./EmployeeListView";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: React.Dispatch<React.SetStateAction<User | null>>;
}

export const EmployeeCommunications: React.FC<EmployeeCommunicationsProps> = ({ 
  selectedEmployee: propSelectedEmployee,
  setSelectedEmployee: propSetSelectedEmployee
}) => {
  const { currentUser } = useAuth();
  const { employees, loading: employeesLoading } = useEmployeeDirectory();
  // Exclude shift coverage messages from employee communications
  const { messages, isLoading: messagesLoading, sendMessage, refreshMessages } = useCommunications(true);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const { isMobileView } = useResponsiveLayout();
  
  const processedMessages = useProcessMessages(messages, currentUser);
  
  const handleSelectEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  };

  const loading = employeesLoading || messagesLoading;

  // For mobile layout, show either conversations list or specific conversation
  if (isMobileView) {
    return selectedEmployee ? (
      <EmployeeConversationView
        selectedEmployee={selectedEmployee}
        messages={processedMessages}
        loading={loading}
        onBack={() => setSelectedEmployee(null)}
        onSendMessage={(message) => sendMessage({
          recipientId: selectedEmployee.id,
          message,
          type: 'general'
        })}
        onRefresh={refreshMessages}
      />
    ) : (
      <EmployeeListView
        employees={employees || []}
        messages={processedMessages}
        loading={loading}
        onSelectEmployee={handleSelectEmployee}
        onRefresh={refreshMessages}
      />
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-15rem)]">
      <div className="md:w-1/3 border-r pr-4">
        <EmployeeListView
          employees={employees || []}
          messages={processedMessages}
          loading={loading}
          onSelectEmployee={handleSelectEmployee}
          selectedEmployee={selectedEmployee}
          onRefresh={refreshMessages}
        />
      </div>
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="md:w-2/3 pl-4 mt-4 md:mt-0">
        {selectedEmployee ? (
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={processedMessages}
            loading={loading}
            onSendMessage={(message) => sendMessage({
              recipientId: selectedEmployee.id,
              message,
              type: 'general'
            })}
            onRefresh={refreshMessages}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select an employee to view conversation
          </div>
        )}
      </div>
    </div>
  );
};
