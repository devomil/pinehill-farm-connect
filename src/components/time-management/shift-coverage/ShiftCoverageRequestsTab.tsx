
import React, { useState, useMemo } from "react";
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
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployeeDirectory();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  // Filter shift coverage requests from messages
  const shiftCoverageRequests = useMemo(() => {
    // Add debug logging
    console.log("Processing shift coverage requests:", messages?.length);
    
    if (!messages?.length) {
      return [];
    }
    
    const filtered = messages.filter(message => {
      const isShiftCoverage = message.type === "shift_coverage";
      const isRelevantToUser = message.recipient_id === currentUser.id || message.sender_id === currentUser.id;
      const hasShiftRequests = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
      
      return isShiftCoverage && isRelevantToUser && hasShiftRequests;
    });
    
    console.log("Filtered shift coverage requests:", filtered.length);
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
    onRefresh();
  };

  if (error) {
    return <ShiftRequestsErrorState onRetry={handleManualRefresh} />;
  }

  if (loading || employeesLoading) {
    return <ShiftRequestsLoadingState />;
  }

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
            allEmployees={allEmployees || []}
            onRequestSent={onRefresh}
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyRequestsState filter={filter} setFilter={setFilter} />
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
