
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { NewShiftCoverageRequestButton } from "../NewShiftCoverageRequestButton";
import { useTimeManagement } from "@/contexts/timeManagement";

interface EmptyRequestsStateProps {
  currentUser: User;
}

export const EmptyRequestsState: React.FC<EmptyRequestsStateProps> = ({
  currentUser
}) => {
  const { allEmployees, refreshMessages } = useTimeManagement();
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="text-center space-y-4 py-8">
          <h3 className="text-lg font-medium">No Shift Coverage Requests</h3>
          <p className="text-sm text-muted-foreground">
            There are no shift coverage requests at this time.
          </p>
          
          <div className="flex justify-center">
            <NewShiftCoverageRequestButton
              currentUser={currentUser}
              allEmployees={allEmployees || []}
              onRequestSent={refreshMessages}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
