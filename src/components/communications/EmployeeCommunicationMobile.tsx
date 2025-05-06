import React from "react";
import { Bug, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";

interface EmployeeCommunicationMobileProps {
  selectedEmployee: User | null;
  processedMessages: Communication[];
  loading: boolean;
  unfilteredEmployees: User[];
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
  handleSelectEmployee: (employee: User) => void;
  sendMessage: (params: any) => void;
  handleRefresh: () => void;
  error: any;
  employeesLoading: boolean;
  messagesLoading: boolean;
  currentUser: User | null;
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
  currentUser
}: EmployeeCommunicationMobileProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter messages to find unread ones
  const unreadMessages = React.useMemo(() => {
    if (!currentUser || !processedMessages) return [];
    return processedMessages.filter(msg => 
      msg.recipient_id === currentUser.id && !msg.read_at
    );
  }, [processedMessages, currentUser]);

  if (selectedEmployee) {
    return (
      <EmployeeConversationView
        selectedEmployee={selectedEmployee}
        messages={processedMessages}
        loading={loading}
        onBack={() => handleSelectEmployee(null)}
        onSendMessage={(message) => sendMessage({
          recipientId: selectedEmployee.id,
          message,
          type: 'general'
        })}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Employee Messages</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <Bug className="h-4 w-4 mr-1" /> {showDebugInfo ? "Hide" : "Debug"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>
      
      {/* Replace employee list with dropdown */}
      <EmployeeDropdownSelect
        employees={unfilteredEmployees}
        onSelectEmployee={handleSelectEmployee}
        selectedEmployee={selectedEmployee}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessages={unreadMessages}
      />
      
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-2">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
              <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
              <p><strong>Employee count:</strong> {unfilteredEmployees?.length || 0}</p>
              <p><strong>Current user:</strong> {currentUser?.email || 'none'}</p>
              <p><strong>Unread messages:</strong> {unreadMessages.length}</p>
              
              {unfilteredEmployees && unfilteredEmployees.length > 0 && (
                <>
                  <p className="mt-2 font-semibold">Employee sample:</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(unfilteredEmployees.slice(0, 2), null, 2)}
                  </pre>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {/* Show unread message previews */}
      {unreadMessages.length > 0 && (
        <div className="space-y-2 mb-2">
          <h4 className="text-sm font-medium flex items-center text-primary">
            <Bell className="h-4 w-4 mr-1.5" />
            New Messages ({unreadMessages.length})
          </h4>
          {unreadMessages.slice(0, 4).map((msg, idx) => {
            const sender = unfilteredEmployees.find(emp => emp.id === msg.sender_id);
            return (
              <div 
                key={idx} 
                className="bg-muted/30 p-3 rounded border-l-4 border-primary"
                onClick={() => {
                  if (sender) handleSelectEmployee(sender);
                }}
              >
                <div className="flex justify-between mb-1">
                  <div className="font-medium">
                    {sender?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm line-clamp-2">{msg.message}</div>
              </div>
            );
          })}
          {unreadMessages.length > 4 && (
            <div className="text-sm text-muted-foreground text-center">
              And {unreadMessages.length - 4} more message(s)...
            </div>
          )}
        </div>
      )}
      
      {/* Show all employees for selection */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">All Employees</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {unfilteredEmployees.map(employee => {
            const hasUnread = unreadMessages.some(msg => msg.sender_id === employee.id);
            const unreadCount = unreadMessages.filter(msg => msg.sender_id === employee.id).length;
            
            return (
              <div 
                key={employee.id}
                className={`p-3 rounded flex justify-between items-center cursor-pointer ${
                  hasUnread 
                    ? "bg-primary/5 border border-primary/20" 
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
                onClick={() => handleSelectEmployee(employee)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-xs text-muted-foreground">{employee.email}</span>
                </div>
                {hasUnread && (
                  <div className="bg-primary text-primary-foreground rounded-full h-6 min-w-6 flex items-center justify-center text-xs">
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
