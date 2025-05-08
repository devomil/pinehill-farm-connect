
import React from "react";
import { User } from "@/types";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { Communication } from "@/types/communications/communicationTypes";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeCommunicationDebug } from "./EmployeeCommunicationDebug";

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
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get filtered messages for the selected employee
  const filteredMessages = selectedEmployee
    ? processedMessages.filter(
        (message) =>
          (message.sender_id === selectedEmployee.id && message.recipient_id === currentUser?.id) ||
          (message.recipient_id === selectedEmployee.id && message.sender_id === currentUser?.id)
      )
    : [];
      
  // Get conversation partners to show recent conversations
  const conversationPartners = React.useMemo(() => {
    const uniqueIds = new Set<string>();
    const partners: User[] = [];
    
    processedMessages.forEach(message => {
      const otherId = message.sender_id === currentUser?.id ? message.recipient_id : message.sender_id;
      if (!uniqueIds.has(otherId)) {
        uniqueIds.add(otherId);
        const partner = unfilteredEmployees.find(emp => emp.id === otherId);
        if (partner) partners.push(partner);
      }
    });
    
    return partners;
  }, [processedMessages, unfilteredEmployees, currentUser]);

  // Handle sending message to selected employee
  const handleSendMessage = (message: string) => {
    if (!selectedEmployee || !currentUser) return;
    
    return sendMessage({
      recipientId: selectedEmployee.id,
      message,
      type: "general",
    });
  };

  // Clear selected employee
  const handleBack = () => {
    handleSelectEmployee(null as unknown as User);
  };

  return (
    <div className="space-y-4">
      <EmployeeCommunicationsHeader onRefresh={handleRefresh} />
      
      {selectedEmployee ? (
        <>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Direct Messages</h2>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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
