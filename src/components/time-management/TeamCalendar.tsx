
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCalendarProps } from "./TeamCalendar.types";
import { useTeamCalendarData } from "./useTeamCalendarData";
import { TeamCalendarHeader } from "./TeamCalendarHeader";
import { TeamCalendarSidebar } from "./TeamCalendarSidebar";

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ currentUser }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    calendarItems,
    loading,
    calendarHighlightDays,
    fetchData
  } = useTeamCalendarData(currentUser);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Card>
      <TeamCalendarHeader
        currentUser={currentUser}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onEventCreated={fetchData}
      />
      <CardContent>
        <TeamCalendarSidebar
          calendarHighlightDays={calendarHighlightDays}
          calendarItems={calendarItems}
          selectedDate={selectedDate}
          loading={loading}
          onDateSelect={handleDateSelect}
        />
      </CardContent>
    </Card>
  );
};

