
import React from "react";
import { Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { EmployeeListView } from "./EmployeeListView";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-2">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
              <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
              <p><strong>Employee count:</strong> {unfilteredEmployees?.length || 0}</p>
              <p><strong>Current user:</strong> {currentUser?.email || 'none'}</p>
              
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
      
      <EmployeeListView
        employees={unfilteredEmployees || []}
        messages={processedMessages}
        loading={loading}
        onSelectEmployee={handleSelectEmployee}
        onRefresh={handleRefresh}
        error={error}
      />
    </div>
  );
}
