
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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  // Use either the provided employees or the ones from the directory hook
  const allEmployees = propEmployees || directoryEmployees;
  
  // Show more detailed loading logs
  useEffect(() => {
    console.log("ShiftCoverageRequestsTab - Loading state:", loading);
    console.log("ShiftCoverageRequestsTab - Employees loading:", employeesLoading);
    console.log("ShiftCoverageRequestsTab - Employee count:", allEmployees?.length || 0);
    console.log("ShiftCoverageRequestsTab - Messages count:", messages?.length || 0);
  }, [loading, employeesLoading, allEmployees, messages]);
  
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
            Error loading shift coverage data: {error?.message || employeesError?.message || "Unknown error"}
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
