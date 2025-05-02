
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { NewShiftCoverageRequestButton } from "../NewShiftCoverageRequestButton";
import { User } from "@/types";
import { Heading } from "@/components/ui/heading";

interface ShiftCoverageHeaderProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalCount: number;
  onRefresh: () => void;
  currentUser: User;
  availableEmployees: User[];
}

export const ShiftCoverageHeader: React.FC<ShiftCoverageHeaderProps> = ({
  filter,
  setFilter,
  pendingCount,
  acceptedCount,
  declinedCount,
  totalCount,
  onRefresh,
  currentUser,
  availableEmployees,
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Heading title="Shift Coverage Requests" />
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <NewShiftCoverageRequestButton 
            currentUser={currentUser}
            allEmployees={availableEmployees}
            onRequestSent={onRefresh}
          />
        </div>
      </div>
      
      <FilterBar 
        filter={filter}
        setFilter={setFilter}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        totalCount={totalCount}
      />
    </div>
  );
};
