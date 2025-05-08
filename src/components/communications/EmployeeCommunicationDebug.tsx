
import React from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User } from "@/types";

interface EmployeeCommunicationDebugProps {
  showDebugInfo?: boolean;
  setShowDebugInfo?: (show: boolean) => void;
  employeesLoading?: boolean;
  messagesLoading?: boolean;
  unfilteredEmployees?: any[];
  processedMessages?: any[];
  currentUser?: any;
  employeeError?: any;
  messagesError?: any;
  retryCount?: number;
  // Add the missing props that are being passed
  employeesCount?: number;
  messagesCount?: number;
  selectedEmployee?: User | null;
  filteredCount?: number;
  loading?: boolean;
  error?: any;
}

export function EmployeeCommunicationDebug({
  showDebugInfo,
  setShowDebugInfo,
  employeesLoading,
  messagesLoading,
  unfilteredEmployees,
  processedMessages,
  currentUser,
  employeeError,
  messagesError,
  retryCount = 0,
  // Include the new props with defaults
  employeesCount = 0,
  messagesCount = 0,
  selectedEmployee = null,
  filteredCount = 0,
  loading = false,
  error = null
}: EmployeeCommunicationDebugProps) {
  if (!showDebugInfo) {
    return (
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugInfo && setShowDebugInfo(true)}
        >
          <Bug className="h-4 w-4 mr-1" /> Show Debug
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugInfo && setShowDebugInfo(false)}
        >
          <Bug className="h-4 w-4 mr-1" /> Hide Debug
        </Button>
      </div>
      
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="debug-info">
          <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
          <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
            <p><strong>Employee loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
            <p><strong>Message loading:</strong> {messagesLoading ? 'true' : 'false'}</p>
            <p><strong>Employee count:</strong> {employeesCount || unfilteredEmployees?.length || 0}</p>
            <p><strong>Processed messages:</strong> {messagesCount || processedMessages?.length || 0}</p>
            <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
            <p><strong>Retry count:</strong> {retryCount}</p>
            
            {(error || employeeError) && (
              <>
                <p className="mt-2 font-semibold text-red-500">Employee Error:</p>
                <pre className="whitespace-pre-wrap text-red-500">
                  {typeof (error || employeeError) === 'object' ? JSON.stringify(error || employeeError, null, 2) : String(error || employeeError)}
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
    </>
  );
}
