
import React, { useMemo } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftCoverageItem } from "./ShiftCoverageItem";
import { ShiftCoverageEmpty } from "./ShiftCoverageEmpty";

interface ShiftCoverageListProps {
  shiftCoverageRequests: Communication[];
  currentUser: User;
  onRefresh: (e: React.MouseEvent) => void;
}

export const ShiftCoverageList: React.FC<ShiftCoverageListProps> = ({
  shiftCoverageRequests,
  currentUser,
  onRefresh
}) => {
  // Filter to only show pending requests
  const filteredMessages = useMemo(() => {
    if (!shiftCoverageRequests || shiftCoverageRequests.length === 0) return [];
    
    return shiftCoverageRequests
      .filter(msg => {
        // Must have shift coverage requests
        if (!msg.shift_coverage_requests || msg.shift_coverage_requests.length === 0) {
          return false;
        }
        
        // Pending requests only for the card
        const isPending = msg.shift_coverage_requests[0].status === 'pending';
        
        return isPending;
      })
      .slice(0, 5); // Limit to 5 most recent
  }, [shiftCoverageRequests]);

  const hasRequests = filteredMessages.length > 0;

  if (!hasRequests) {
    return <ShiftCoverageEmpty onRefresh={onRefresh} />;
  }

  return (
    <div className="space-y-2">
      {filteredMessages.map((message) => (
        <ShiftCoverageItem 
          key={message.id}
          message={message}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};
