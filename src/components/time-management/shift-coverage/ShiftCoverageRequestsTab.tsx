
import React, { useState, useMemo, useEffect } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { NewShiftCoverageRequestButton } from "../NewShiftCoverageRequestButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FilterBar } from "./FilterBar";
import { ShiftRequestsLoadingState } from "./ShiftRequestsLoadingState";
import { ShiftRequestsErrorState } from "./ShiftRequestsErrorState";
import { EmptyRequestsState } from "./EmptyRequestsState";
import { ShiftRequestCard } from "./ShiftRequestCard";

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
  
  // Log data when component mounts or dependencies change
  useEffect(() => {
    console.log("ShiftCoverageRequestsTab - Current messages:", messages);
    console.log("ShiftCoverageRequestsTab - Loading state:", loading);
    console.log("ShiftCoverageRequestsTab - Available employees:", 
      allEmployees?.filter(e => e.id !== currentUser?.id).length || 0);
    console.log("ShiftCoverageRequestsTab - Current user:", currentUser?.id);
    
    if (error) {
      console.error("ShiftCoverageRequestsTab - Error state:", error);
    }
  }, [messages, loading, error, currentUser, allEmployees]);

  // Filter shift coverage requests from messages
  const shiftCoverageRequests = useMemo(() => {
    console.log("Processing shift coverage requests from", messages?.length || 0, "messages");
    
    if (!messages?.length) {
      console.log("No messages found to filter for shift coverage requests");
      return [];
    }
    
    const filtered = messages.filter(message => {
      const isShiftCoverage = message.type === "shift_coverage";
      const isRelevantToUser = message.recipient_id === currentUser.id || message.sender_id === currentUser.id;
      const hasShiftRequests = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
      
      if (isShiftCoverage) {
        console.log(`Message ${message.id}: type=${message.type}, recipient=${message.recipient_id}, sender=${message.sender_id}, requests=${message.shift_coverage_requests?.length || 0}`);
      }
      
      return isShiftCoverage && isRelevantToUser && hasShiftRequests;
    });
    
    console.log("Filtered shift coverage requests:", filtered.length);
    if (filtered.length > 0) {
      console.log("First request details:", filtered[0]);
    }
    return filtered;
  }, [messages, currentUser]);

  // Apply status filter
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return shiftCoverageRequests;
    }
    return shiftCoverageRequests.filter(request => request.status === filter);
  }, [shiftCoverageRequests, filter]);

  const pendingCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'pending').length, 
    [shiftCoverageRequests]
  );

  const acceptedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'accepted').length, 
    [shiftCoverageRequests]
  );

  const declinedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => req.status === 'declined').length, 
    [shiftCoverageRequests]
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <FilterBar 
          filter={filter}
          setFilter={setFilter}
          pendingCount={pendingCount}
          acceptedCount={acceptedCount}
          declinedCount={declinedCount}
          totalCount={shiftCoverageRequests.length}
        />
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <NewShiftCoverageRequestButton 
            currentUser={currentUser}
            allEmployees={availableEmployees}
            onRequestSent={onRefresh}
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyRequestsState 
          filter={filter}
          setFilter={setFilter}
          onRefresh={handleManualRefresh}
          employeeCount={availableEmployees.length}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <ShiftRequestCard
              key={request.id}
              request={request}
              currentUser={currentUser}
              findEmployee={findEmployee}
              onRespond={onRespond}
            />
          ))}
        </div>
      )}
    </>
  );
};
