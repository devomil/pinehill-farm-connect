
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamCalendarEventForm } from "./TeamCalendarEventForm";
import { TeamCalendarProps } from "./TeamCalendar.types";

interface TeamCalendarHeaderProps extends TeamCalendarProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onEventCreated: () => void;
}

export const TeamCalendarHeader: React.FC<TeamCalendarHeaderProps> = ({
  currentUser,
  dialogOpen,
  setDialogOpen,
  onEventCreated,
}) => (
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>Team Calendar</CardTitle>
        <CardDescription>
          View upcoming time-off and company events for better team coverage.
        </CardDescription>
      </div>
      {(currentUser.role === "admin" || currentUser.role === "manager") && (
        <TeamCalendarEventForm
          open={dialogOpen}
          setOpen={setDialogOpen}
          onEventCreated={onEventCreated}
          currentUser={currentUser}
        />
      )}
    </div>
  </CardHeader>
);
