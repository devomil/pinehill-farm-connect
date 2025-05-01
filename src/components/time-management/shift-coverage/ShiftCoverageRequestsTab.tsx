
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
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("ShiftCoverageRequestsTab - Raw messages received:", messages);
    if (messages.length > 0) {
      messages.forEach(msg => {
        if (msg.type === 'shift_coverage') {
          console.log(`Message ${msg.id}: sender=${msg.sender_id}, recipient=${msg.recipient_id}, status=${msg.status}, shift_requests=${msg.shift_coverage_requests?.length || 0}`);
          
          if (msg.shift_coverage_requests && msg.shift_coverage_requests.length > 0) {
            console.log("First shift request:", msg.shift_coverage_requests[0]);
          }
        }
      });
    }
    
    console.log("Current user:", currentUser.id, currentUser.email);
    console.log("Filter state:", filter);
  }, [messages, currentUser, filter]);

  // Filter shift coverage requests from messages - FIX: Improved filtering logic
  const shiftCoverageRequests = useMemo(() => {
    if (!messages || messages.length === 0) {
      console.log("No messages found for shift coverage filtering");
      return [];
    }
    
    const filtered = messages.filter(message => {
      const isShiftCoverage = message.type === "shift_coverage";
      const hasShiftRequests = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
      const isRelevantToUser = message.recipient_id === currentUser.id || message.sender_id === currentUser.id;
      
      // Log each message being considered
      if (isShiftCoverage) {
        console.log(`Filtering message ${message.id}: type=${message.type}, recipient=${message.recipient_id}, sender=${message.sender_id}, isRelevant=${isRelevantToUser}, hasRequests=${hasShiftRequests}`);
      }
      
      return isShiftCoverage && isRelevantToUser && hasShiftRequests;
    });
    
    console.log(`Filtered ${filtered.length} shift coverage requests from ${messages.length} messages`);
    return filtered;
  }, [messages, currentUser]);

  // Apply status filter
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return shiftCoverageRequests;
    }
    
    const statusFiltered = shiftCoverageRequests.filter(request => {
      if (!request.shift_coverage_requests || request.shift_coverage_requests.length === 0) {
        return false;
      }
      
      // Use the status from the shift_coverage_requests instead of the message status
      const requestStatus = request.shift_coverage_requests[0].status;
      return requestStatus === filter;
    });
    
    console.log(`Status filtered to ${filter}: ${statusFiltered.length} requests`);
    return statusFiltered;
  }, [shiftCoverageRequests, filter]);

  // Calculate counts for different status types - Fixed to use shift request status
  const pendingCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'pending'
    ).length, 
    [shiftCoverageRequests]
  );

  const acceptedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'accepted'
    ).length, 
    [shiftCoverageRequests]
  );

  const declinedCount = useMemo(() => 
    shiftCoverageRequests.filter(req => 
      req.shift_coverage_requests && 
      req.shift_coverage_requests.length > 0 && 
      req.shift_coverage_requests[0].status === 'declined'
    ).length, 
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
