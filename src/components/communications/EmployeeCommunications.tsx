
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { EmployeeListView } from "./EmployeeListView";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Bug } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: React.Dispatch<React.SetStateAction<User | null>>;
  onRefresh?: () => void;
  retryCount?: number;
}

export const EmployeeCommunications: React.FC<EmployeeCommunicationsProps> = ({ 
  selectedEmployee: propSelectedEmployee,
  setSelectedEmployee: propSetSelectedEmployee,
  onRefresh: propsOnRefresh,
  retryCount = 0
}) => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees, loading: employeesLoading, error: employeeError, refetch: refetchEmployees } = useEmployeeDirectory();
  // Exclude shift coverage messages from employee communications
  const { messages, isLoading: messagesLoading, sendMessage, refreshMessages, error: messagesError } = useCommunications(true);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const { isMobileView } = useResponsiveLayout();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const processedMessages = useProcessMessages(messages, currentUser);
  const loading = employeesLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      console.log(`Retrying employee fetch due to retryCount: ${retryCount}`);
      refetchEmployees();
      refreshMessages();
    }
  }, [retryCount, refetchEmployees, refreshMessages]);

  // Log debugging information
  useEffect(() => {
    console.log("EmployeeCommunications - employeesLoading:", employeesLoading);
    console.log("EmployeeCommunications - messagesLoading:", messagesLoading);
    console.log("EmployeeCommunications - unfilteredEmployees count:", unfilteredEmployees?.length || 0);
    console.log("EmployeeCommunications - processedMessages count:", processedMessages?.length || 0);
    console.log("EmployeeCommunications - employeeError:", employeeError ? 
      (typeof employeeError === 'string' ? employeeError : employeeError.message || 'Unknown error') : 'None');
    console.log("EmployeeCommunications - messagesError:", messagesError ? 
      (typeof messagesError === 'string' ? messagesError : messagesError.message || 'Unknown error') : 'None');
    
    // When component mounts, ensure we have fresh employee data
    if (!unfilteredEmployees || unfilteredEmployees.length === 0) {
      console.log("No employees found, fetching fresh data");
      refetchEmployees();
    }
  }, [employeesLoading, messagesLoading, unfilteredEmployees, processedMessages, employeeError, messagesError, refetchEmployees]);
  
  const handleSelectEmployee = (employee: User) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing employee data and messages");
    refetchEmployees();
    refreshMessages();
    
    // Also call parent's onRefresh if provided
    if (propsOnRefresh) {
      propsOnRefresh();
    }
  };

  // Format error message safely
  const formatErrorMessage = (err: any): React.ReactNode => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };

  // Show error message if there's an issue
  if (error && !loading) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading communications data: {formatErrorMessage(error)}
          </AlertDescription>
        </Alert>
        
        {/* Debug toggle and panel */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <Bug className="h-4 w-4 mr-1" /> {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
        
        {showDebugInfo && (
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="debug-info">
              <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
              <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
                <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
                <p><strong>Employee count:</strong> {unfilteredEmployees?.length || 0}</p>
                <p><strong>Processed messages:</strong> {processedMessages?.length || 0}</p>
                <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
                <p><strong>Retry count:</strong> {retryCount}</p>
                
                {employeeError && (
                  <>
                    <p className="mt-2 font-semibold text-red-500">Employee Error:</p>
                    <pre className="whitespace-pre-wrap text-red-500">
                      {typeof employeeError === 'object' ? JSON.stringify(employeeError, null, 2) : String(employeeError)}
                    </pre>
                  </>
                )}
                
                {messagesError && (
                  <>
                    <p className="mt-2 font-semibold text-red-500">Messages Error:</p>
                    <pre className="whitespace-pre-wrap text-red-500">
                      {typeof messagesError === 'object' ? JSON.stringify(messagesError, null, 2) : String(messagesError)}
                    </pre>
                  </>
                )}
                
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
        
        <div className="p-4 text-center">
          <Button 
            variant="default" 
            onClick={handleRefresh}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>
    );
  }

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
        onRefresh={handleRefresh}
      />
    ) : (
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

  // For desktop layout, show both conversations list and selected conversation
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-15rem)]">
      <div className="md:w-1/3 border-r pr-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Employees</h3>
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
        
        {showDebugInfo && (
          <Accordion type="single" collapsible className="mb-2">
            <AccordionItem value="debug-info">
              <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
              <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
                <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
                <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
                <p><strong>Employee count:</strong> {unfilteredEmployees?.length || 0}</p>
                <p><strong>Messages count:</strong> {processedMessages?.length || 0}</p>
                <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
                
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
          selectedEmployee={selectedEmployee}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="md:w-2/3 pl-4 mt-4 md:mt-0">
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
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select an employee to view conversation
          </div>
        )}
      </div>
    </div>
  );
};
