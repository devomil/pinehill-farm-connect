
import React from "react";
import { Bug, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";

interface EmployeeCommunicationDesktopProps {
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
  currentUser
}: EmployeeCommunicationDesktopProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Filter messages to find unread ones
  const unreadMessages = React.useMemo(() => {
    if (!currentUser || !processedMessages) return [];
    return processedMessages.filter(msg => 
      msg.recipient_id === currentUser.id && !msg.read_at
    );
  }, [processedMessages, currentUser]);

  return (
    <div className="flex flex-col h-[calc(100vh-15rem)]">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
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
              <RefreshCw className="h-4 w-4" /> 
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
          <Accordion type="single" collapsible className="mb-2 mt-2">
            <AccordionItem value="debug-info">
              <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
              <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
                <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
                <p><strong>Employee count:</strong> {unfilteredEmployees?.length || 0}</p>
                <p><strong>Messages count:</strong> {processedMessages?.length || 0}</p>
                <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
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
      </div>
      
      <div className="flex-1 overflow-hidden">
        {selectedEmployee ? (
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={processedMessages}
            loading={loading}
            onSendMessage={(message) => {
              console.log(`Sending message to ${selectedEmployee.name} (${selectedEmployee.id})`);
              sendMessage({
                recipientId: selectedEmployee.id,
                message,
                type: 'general'
              });
            }}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground flex-col p-4">
            {unreadMessages.length > 0 ? (
              <>
                <div className="text-lg font-medium">You have {unreadMessages.length} unread message(s)</div>
                <p className="text-sm mb-4">Select an employee from the dropdown to view your conversation</p>
                {unreadMessages.slice(0, 3).map((msg, idx) => (
                  <div key={idx} className="bg-muted/30 p-3 rounded mb-2 max-w-md w-full">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">
                        {unfilteredEmployees.find(emp => emp.id === msg.sender_id)?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm line-clamp-2">{msg.message}</div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs mt-1"
                      onClick={() => {
                        const sender = unfilteredEmployees.find(emp => emp.id === msg.sender_id);
                        if (sender) handleSelectEmployee(sender);
                      }}
                    >
                      View conversation
                    </Button>
                  </div>
                ))}
                {unreadMessages.length > 3 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    And {unreadMessages.length - 3} more unread message(s)...
                  </div>
                )}
              </>
            ) : (
              <>
                <p>Select an employee to view conversation</p>
                <p className="text-sm text-muted-foreground">No unread messages</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
