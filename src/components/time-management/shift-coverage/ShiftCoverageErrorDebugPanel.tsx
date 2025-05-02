
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bug } from "lucide-react";

interface ShiftCoverageErrorDebugPanelProps {
  loading: boolean;
  employeesLoading: boolean;
  messagesCount: number;
  employeeCount: number;
  currentUser: any;
  error?: any;
  employeesError?: any;
}

export const ShiftCoverageErrorDebugPanel: React.FC<ShiftCoverageErrorDebugPanelProps> = ({
  loading,
  employeesLoading,
  messagesCount,
  employeeCount,
  currentUser,
  error,
  employeesError
}) => {
  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value="debug-info">
        <AccordionTrigger className="text-sm">
          <span className="flex items-center">
            <Bug className="h-3 w-3 mr-1" /> Debug Information
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
          <p><strong>Loading state:</strong> {loading ? "true" : "false"}</p>
          <p><strong>Employees loading state:</strong> {employeesLoading ? "true" : "false"}</p>
          <p><strong>Messages count:</strong> {messagesCount}</p>
          <p><strong>Employee count:</strong> {employeeCount}</p>
          <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
          
          {error && (
            <>
              <p className="mt-2 font-semibold text-red-500">Error:</p>
              <pre className="whitespace-pre-wrap text-red-500">
                {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
              </pre>
            </>
          )}
          
          {employeesError && (
            <>
              <p className="mt-2 font-semibold text-red-500">Employees Error:</p>
              <pre className="whitespace-pre-wrap text-red-500">
                {typeof employeesError === 'object' ? JSON.stringify(employeesError, null, 2) : String(employeesError)}
              </pre>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
