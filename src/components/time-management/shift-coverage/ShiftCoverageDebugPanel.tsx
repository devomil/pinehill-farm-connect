
import React from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

interface ShiftCoverageDebugPanelProps {
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
  shiftCoverageRequests: Communication[];
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  filter: string;
  availableEmployees: User[];
  currentUser: User;
  loading?: boolean;
  employeesLoading?: boolean;
  error?: any;
  employeesError?: any;
}

export const ShiftCoverageDebugPanel: React.FC<ShiftCoverageDebugPanelProps> = ({
  showDebugInfo,
  setShowDebugInfo,
  shiftCoverageRequests,
  pendingCount,
  acceptedCount,
  declinedCount,
  filter,
  availableEmployees,
  currentUser,
  loading,
  employeesLoading,
  error,
  employeesError
}) => {
  return (
    <>
      {/* Debug toggle button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="h-8 text-xs"
        >
          <Bug className="h-3 w-3 mr-1" /> {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {/* Debug information panel */}
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Shift Coverage Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Total shift coverage messages:</strong> {shiftCoverageRequests.length}</p>
              <p><strong>Pending count:</strong> {pendingCount}</p>
              <p><strong>Accepted count:</strong> {acceptedCount}</p>
              <p><strong>Declined count:</strong> {declinedCount}</p>
              <p><strong>Current filter:</strong> {filter}</p>
              <p><strong>Available employees:</strong> {availableEmployees.length}</p>
              <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
              
              {loading !== undefined && (
                <p><strong>Loading state:</strong> {loading ? "true" : "false"}</p>
              )}
              
              {employeesLoading !== undefined && (
                <p><strong>Employees loading state:</strong> {employeesLoading ? "true" : "false"}</p>
              )}
              
              {availableEmployees.length > 0 && (
                <>
                  <p className="mt-2 font-semibold">Employee sample:</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(availableEmployees.slice(0, 2), null, 2)}
                  </pre>
                </>
              )}
              
              {shiftCoverageRequests.length > 0 && (
                <>
                  <p className="mt-2 font-semibold">Shift coverage message sample:</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(shiftCoverageRequests[0], null, 2)}
                  </pre>
                </>
              )}
              
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
      )}
    </>
  );
};
