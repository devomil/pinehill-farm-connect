
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftRequestCard } from "./ShiftRequestCard";

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
  availableEmployeeCount
}) => {
  if (requests.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No {filter !== 'all' ? filter : ''} shift coverage requests found.
        </p>
        {filter !== 'all' && (
          <button
            className="text-sm text-blue-500 hover:underline mt-2"
            onClick={() => setFilter('all')}
          >
            View all requests
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <ShiftRequestCard
          key={request.id}
          message={request}
          onRespond={onRespond}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};
