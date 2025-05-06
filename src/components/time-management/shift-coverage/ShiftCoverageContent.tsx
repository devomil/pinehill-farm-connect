
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftRequestsList } from "./ShiftRequestsList";
import { FilterBar } from "./FilterBar";

interface ShiftCoverageContentProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  shiftCoverageRequests: Communication[];
  filteredRequests: Communication[];
  currentUser: User;
  availableEmployees: User[];
  allEmployees: User[];
  findEmployee: (id: string) => User | undefined;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  handleManualRefresh: () => void;
}

export const ShiftCoverageMainContent: React.FC<ShiftCoverageContentProps> = ({
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
  return (
    <>
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
