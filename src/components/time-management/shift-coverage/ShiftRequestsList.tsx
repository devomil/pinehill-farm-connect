
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftRequestCard } from "./ShiftRequestCard";

interface ShiftRequestsListProps {
  messages: Communication[];
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => Promise<any>;
  currentUser: User;
}

export const ShiftRequestsList: React.FC<ShiftRequestsListProps> = ({
  messages,
  onRespond,
  currentUser
}) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ShiftRequestCard
          key={message.id}
          message={message}
          onRespond={onRespond}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};
