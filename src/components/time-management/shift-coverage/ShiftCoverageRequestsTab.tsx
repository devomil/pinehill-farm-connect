
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
    console.log("ShiftCoverageRequestsTab - Render with messages:", messages.length);
    
    if (messages.length > 0) {
      // Log all messages to inspect what's available
      messages.forEach((msg, idx) => {
        if (msg.type === 'shift_coverage') {
          console.log(`Shift Coverage Message ${idx}: sender=${msg.sender_id}, recipient=${msg.recipient_id}, type=${msg.type}`);
          console.log(`Message details: id=${msg.id}, status=${msg.status}, shift_requests=${msg.shift_coverage_requests?.length || 0}`);
          
          if (msg.shift_coverage_requests && msg.shift_coverage_requests.length > 0) {
            const request = msg.shift_coverage_requests[0];
            console.log(`Shift request details: date=${request.shift_date}, status=${request.status}`);
          } else {
            console.log("No shift coverage requests found in this message");
          }
        }
      });
    }
    
    console.log("Current user:", currentUser.id, currentUser.email);
  }, [messages, currentUser]);

  // FIXED: Improved filtering logic to properly detect shift coverage messages
  const shiftCoverageRequests = useMemo(() => {
    if (!messages || messages.length === 0) {
      console.log("No messages found for shift coverage filtering");
      return [];
    }
    
    // Better filtering to ensure we include all shift coverage requests
    const filtered = messages.filter(message => {
      // Must be shift_coverage type message
      if (message.type !== "shift_coverage") {
        return false;
      }
      
      // Must be relevant to current user (either sender or recipient)
      const isRelevantToUser = message.sender_id === currentUser.id || message.recipient_id === currentUser.id;
      
      // Must contain at least one shift request
      const hasShiftRequests = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
      
      if (isRelevantToUser && hasShiftRequests) {
        console.log(`Including shift coverage message ${message.id} in filtered results`);
        return true;
      }
      
      return false;
    });
    
    console.log(`ShiftCoverageRequestsTab - Filtered ${filtered.length} shift coverage requests out of ${messages.length} messages`);
    return filtered;
  }, [messages, currentUser.id]);

  // Apply status filter - FIXED to use the shift request status, not the message status
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return shiftCoverageRequests;
    }
    
    const statusFiltered = shiftCoverageRequests.filter(message => {
      if (!message.shift_coverage_requests || message.shift_coverage_requests.length === 0) {
        return false;
      }
      
      // Use the status from the shift_coverage_requests rather than message status
      const requestStatus = message.shift_coverage_requests[0].status;
      const isMatching = requestStatus === filter;
      
      console.log(`Filtering message ${message.id} with status ${requestStatus} against filter ${filter}: ${isMatching}`);
      
      return isMatching;
    });
    
    console.log(`Status filtered to ${filter}: ${statusFiltered.length} requests`);
    return statusFiltered;
  }, [shiftCoverageRequests, filter]);

  // Calculate counts for different status types - FIXED to use shift request status
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

  console.log(`ShiftCoverageRequestsTab - Final filtered requests count: ${filteredRequests.length}`);

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
