import React, { useState, useCallback, useMemo } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { toast } from "sonner";
import { ShiftRequestsLoadingState } from "./ShiftRequestsLoadingState";
import { ShiftRequestsErrorState } from "./ShiftRequestsErrorState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShiftCoverageFilters } from "@/hooks/communications/useShiftCoverageFilters";
import { ShiftCoverageDebugPanel } from "./ShiftCoverageDebugPanel";
import { ShiftCoverageErrorDebugPanel } from "./ShiftCoverageErrorDebugPanel";
import { ShiftCoverageMainContent } from "./ShiftCoverageMainContent";

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
  // Always initialize all hooks at the top level
  const { unfilteredEmployees: directoryEmployees, loading: employeesLoading, refetch: refetchEmployees, error: employeesError } = useEmployeeDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Use either the provided employees or the ones from the directory hook - memoize once
  const allEmployees = useMemo(() => propEmployees || directoryEmployees || [], [propEmployees, directoryEmployees]);
  
  // Ensure we always pass valid arrays to hooks, never undefined
  const safeMessages = useMemo(() => messages || [], [messages]);
  
  // Always define the filter hook with safe values
  const {
    shiftCoverageRequests,
    pendingCount,
    acceptedCount,
    declinedCount,
    filterByStatus,
    updateFilter
  } = useShiftCoverageFilters(safeMessages, currentUser);
  
  // Apply status filter with useMemo to prevent recalculation on every render
  const filteredRequests = useMemo(() => {
    try {
      return filterByStatus(filter, shiftCoverageRequests || []);
    } catch (err) {
      console.error("Error filtering requests:", err);
      return [];
    }
  }, [filter, shiftCoverageRequests, filterByStatus]);
  
  // Format error message safely - memoize to prevent recreation on each render
  const formatErrorMessage = useCallback((err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    return "Unknown error";
  }, []);

  // Find employee by ID - memoize to prevent recreation on each render
  const findEmployee = useCallback((id: string): User | undefined => {
    if (!allEmployees) return undefined;
    return allEmployees.find(emp => emp.id === id);
  }, [allEmployees]);

  // Handle manual refresh with feedback - memoize to prevent recreation on each render
  const handleManualRefresh = useCallback(() => {
    toast.info("Refreshing shift coverage requests...");
    if (refetchEmployees) refetchEmployees();
    if (onRefresh) onRefresh();
    if (updateFilter) updateFilter();
  }, [refetchEmployees, onRefresh, updateFilter]);

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

        <ShiftCoverageErrorDebugPanel
          loading={loading}
          employeesLoading={employeesLoading}
          messagesCount={safeMessages.length}
          employeeCount={allEmployees?.length || 0}
          currentUser={currentUser}
          error={error}
          employeesError={employeesError}
        />

        <ShiftRequestsErrorState onRetry={handleManualRefresh} />
      </>
    );
  }
  
  // Get available employees (excluding current user) - this must be outside the hooks
  const availableEmployees = allEmployees?.filter(emp => emp.id !== currentUser?.id) || [];
  
  return (
    <>
      <ShiftCoverageDebugPanel 
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
        shiftCoverageRequests={shiftCoverageRequests}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        filter={filter}
        availableEmployees={availableEmployees}
        currentUser={currentUser}
      />
      
      <ShiftCoverageMainContent
        filter={filter}
        setFilter={setFilter}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        shiftCoverageRequests={shiftCoverageRequests}
        filteredRequests={filteredRequests}
        currentUser={currentUser}
        availableEmployees={availableEmployees}
        allEmployees={allEmployees || []}
        findEmployee={findEmployee}
        onRespond={onRespond}
        handleManualRefresh={handleManualRefresh}
      />
    </>
  );
};
