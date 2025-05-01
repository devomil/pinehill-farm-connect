
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftRequestCard } from "./ShiftRequestCard";
import { EmptyRequestsState } from "./EmptyRequestsState";

interface ShiftRequestsListProps {
  requests: Communication[];
  currentUser: User;
  findEmployee: (id: string) => User | undefined;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  onRefresh: () => void;
  availableEmployeeCount: number;
}

export const ShiftRequestsList: React.FC<ShiftRequestsListProps> = ({
  requests,
  currentUser,
  findEmployee,
  onRespond,
  filter,
  setFilter,
  onRefresh,
  availableEmployeeCount,
}) => {
  if (requests.length === 0) {
    return (
      <EmptyRequestsState 
        filter={filter}
        setFilter={setFilter}
        onRefresh={onRefresh}
        employeeCount={availableEmployeeCount}
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <ShiftRequestCard
          key={request.id}
          request={request}
          currentUser={currentUser}
          findEmployee={findEmployee}
          onRespond={onRespond}
        />
      ))}
    </div>
  );
};
