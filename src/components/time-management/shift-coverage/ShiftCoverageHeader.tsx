
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { NewShiftCoverageRequestButton } from "../NewShiftCoverageRequestButton";
import { User } from "@/types";

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
  const handleManualRefresh = () => {
    onRefresh();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <FilterBar 
        filter={filter}
        setFilter={setFilter}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        declinedCount={declinedCount}
        totalCount={totalCount}
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
  );
};
