
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { ShiftRequestsList } from "./ShiftRequestsList";
import { ShiftRequestsLoadingState } from "./ShiftRequestsLoadingState";
import { ShiftRequestsErrorState } from "./ShiftRequestsErrorState";
import { EmptyRequestsState } from "./EmptyRequestsState";

interface ShiftCoverageRequestsTabProps {
  messages: Communication[];
  loading: boolean;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  currentUser: User;
  onRefresh: () => void;
  error: any;
}

export const ShiftCoverageRequestsTab: React.FC<ShiftCoverageRequestsTabProps> = ({
  messages,
  loading,
  onRespond,
  currentUser,
  onRefresh,
  error
}) => {
  // Filter for shift coverage type messages
  const shiftMessages = messages.filter(msg => msg.type === 'shift_coverage') || [];
  
  if (error) {
    return <ShiftRequestsErrorState error={error} onRetry={onRefresh} />;
  }
  
  if (loading) {
    return <ShiftRequestsLoadingState />;
  }
  
  if (shiftMessages.length === 0) {
    return <EmptyRequestsState currentUser={currentUser} />;
  }
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Shift Coverage Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ShiftRequestsList 
          requests={shiftMessages}
          currentUser={currentUser}
          onRespond={onRespond}
          findEmployee={() => undefined} // Add a simple implementation for findEmployee
          filter="all" // Add default filter value
          setFilter={() => {}} // Add empty function for setFilter
          onRefresh={onRefresh}
          availableEmployeeCount={0} // Add default availableEmployeeCount
        />
      </CardContent>
    </Card>
  );
};
