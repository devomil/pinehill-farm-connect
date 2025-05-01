
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
}

export const ShiftCoverageRequestsTab: React.FC<ShiftCoverageRequestsTabProps> = ({
  messages,
  loading,
  error,
  onRespond,
  currentUser,
  onRefresh,
}) => {
  const { employees: allEmployees, loading: employeesLoading, refetch: refetchEmployees } = useEmployeeDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  
  const {
    shiftCoverageRequests,
    pendingCount,
    acceptedCount,
    declinedCount,
    filterByStatus
  } = useShiftCoverageFilters(messages, currentUser);
  
  // Apply status filter
  const filteredRequests = filterByStatus(filter, shiftCoverageRequests);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("ShiftCoverageRequestsTab - Render with messages:", messages.length);
    console.log(`ShiftCoverageRequestsTab - Final filtered requests count: ${filteredRequests.length}`);
  }, [messages, filteredRequests]);

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

  // If there's an error, show error state
  if (error) {
    return <ShiftRequestsErrorState onRetry={handleManualRefresh} />;
  }
  
  // Get available employees (excluding current user)
  const availableEmployees = allEmployees?.filter(emp => emp.id !== currentUser.id) || [];

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
