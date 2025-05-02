
import React, { useState, useEffect } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { toast } from "sonner";
import { ShiftRequestsLoadingState } from "./ShiftRequestsLoadingState";
import { ShiftRequestsErrorState } from "./ShiftRequestsErrorState";
import { ShiftCoverageHeader } from "./ShiftCoverageHeader";
import { ShiftRequestsList } from "./ShiftRequestsList";
import { useShiftCoverageFilters } from "@/hooks/communications/useShiftCoverageFilters";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Bug } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ShiftCoverageRequestsTabProps {
  messages: Communication[];
  loading: boolean;
  error?: any;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  currentUser: User;
  onRefresh: () => void;
  allEmployees?: User[];
}

export const ShiftCoverageRequestsTab: React.FC<ShiftCoverageRequestsTabProps> = ({
  messages,
  loading,
  error,
  onRespond,
  currentUser,
  onRefresh,
  allEmployees: propEmployees
}) => {
  const { employees: directoryEmployees, loading: employeesLoading, refetch: refetchEmployees, error: employeesError } = useEmployeeDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Use either the provided employees or the ones from the directory hook
  const allEmployees = propEmployees || directoryEmployees;
  
  // Show more detailed loading logs
  useEffect(() => {
    console.log("ShiftCoverageRequestsTab - Loading state:", loading);
    console.log("ShiftCoverageRequestsTab - Employees loading:", employeesLoading);
    console.log("ShiftCoverageRequestsTab - Employee count:", allEmployees?.length || 0);
    console.log("ShiftCoverageRequestsTab - Messages count:", messages?.length || 0);
    console.log("ShiftCoverageRequestsTab - Error:", error ? (typeof error === 'string' ? error : error.message || 'Unknown error') : 'None');
    console.log("ShiftCoverageRequestsTab - Employee Error:", employeesError ? (typeof employeesError === 'string' ? employeesError : employeesError.message || 'Unknown error') : 'None');
  }, [loading, employeesLoading, allEmployees, messages, error, employeesError]);
  
  const {
    shiftCoverageRequests,
    pendingCount,
    acceptedCount,
    declinedCount,
    filterByStatus
  } = useShiftCoverageFilters(messages, currentUser);
  
  // Apply status filter
  const filteredRequests = filterByStatus(filter, shiftCoverageRequests);
  
  // Find employee by ID
  const findEmployee = (id: string): User | undefined => {
    return allEmployees?.find(emp => emp.id === id);
  };

  // Handle manual refresh with feedback
  const handleManualRefresh = () => {
    toast.info("Refreshing shift coverage requests...");
    refetchEmployees();
    onRefresh();
  };

  // Format error message safely
  const formatErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  };

  // If still loading, show loading state
  if (loading || employeesLoading) {
    return <ShiftRequestsLoadingState />;
  }

  // If there's an error, show error state with retry option
  if (error || employeesError) {
    return (
      <>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading shift coverage data: {formatErrorMessage(error || employeesError)}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>

        {/* Debug information panel */}
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
              <p><strong>Messages count:</strong> {messages?.length || 0}</p>
              <p><strong>Employee count:</strong> {allEmployees?.length || 0}</p>
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

        <ShiftRequestsErrorState onRetry={handleManualRefresh} />
      </>
    );
  }
  
  // Get available employees (excluding current user)
  const availableEmployees = allEmployees?.filter(emp => emp.id !== currentUser.id) || [];
  
  // Show a message if no employees are available
  if (!allEmployees || allEmployees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">No employees available</h3>
        <p className="text-muted-foreground text-center mb-4">
          Could not load employees. You need employees to manage shift coverage.
        </p>
        <Button onClick={handleManualRefresh} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Employee List
        </Button>
      </div>
    );
  }

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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <ShiftCoverageHeader
        filter={filter}
        setFilter={setFilter}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        totalCount={shiftCoverageRequests.length}
        onRefresh={handleManualRefresh}
        currentUser={currentUser}
        availableEmployees={availableEmployees}
      />
      
      <ShiftRequestsList
        requests={filteredRequests}
        currentUser={currentUser}
        findEmployee={findEmployee}
        onRespond={onRespond}
        filter={filter}
        setFilter={setFilter}
        onRefresh={handleManualRefresh}
        availableEmployeeCount={availableEmployees.length}
      />
    </>
  );
};
