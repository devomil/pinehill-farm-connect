
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { AlertCircle, RefreshCw, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftRequestsErrorState } from "./ShiftRequestsErrorState";
import { ShiftCoverageHeader } from "./ShiftCoverageHeader";
import { ShiftRequestsList } from "./ShiftRequestsList";
import { NewShiftCoverageRequestButton } from "../NewShiftCoverageRequestButton";

interface ShiftCoverageMainContentProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  shiftCoverageRequests: Communication[];
  filteredRequests: Communication[];
  currentUser: User;
  availableEmployees: User[];
  allEmployees?: User[];
  findEmployee: (id: string) => User | undefined;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  handleManualRefresh: () => void;
}

export const ShiftCoverageMainContent: React.FC<ShiftCoverageMainContentProps> = ({
  filter,
  setFilter,
  pendingCount,
  acceptedCount,
  declinedCount,
  shiftCoverageRequests,
  filteredRequests,
  currentUser,
  availableEmployees,
  allEmployees,
  findEmployee,
  onRespond,
  handleManualRefresh
}) => {
  // Show a message if no employees are available
  if (!availableEmployees || availableEmployees.length === 0) {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Coverage</h1>
          <p className="text-muted-foreground">Request and manage shift coverage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <NewShiftCoverageRequestButton
            currentUser={currentUser}
            allEmployees={availableEmployees}
            onRequestSent={handleManualRefresh}
          />
        </div>
      </div>

      <FilterBar
        filter={filter}
        setFilter={setFilter}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        totalCount={shiftCoverageRequests.length}
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

// Import FilterBar at the top of the file
import { FilterBar } from "./FilterBar";
