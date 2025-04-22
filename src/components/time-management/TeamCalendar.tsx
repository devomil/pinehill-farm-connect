
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { TeamCalendarEventForm } from "./TeamCalendarEventForm";
import { TeamCalendarEventsList } from "./TeamCalendarEventsList";
import { TeamCalendarProps } from "./TeamCalendar.types";
import { useTeamCalendarData } from "./useTeamCalendarData";

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
              onEventCreated={fetchData}
              currentUser={currentUser}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex-1">
            <DayCalendar
              mode="multiple"
              selected={calendarHighlightDays}
              modifiersClassNames={{
                selected: "bg-blue-400 text-white !opacity-100"
              }}
              className="border border-muted rounded-md"
              showOutsideDays
              onDayClick={handleDateSelect}
            />
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <TeamCalendarEventsList
                calendarItems={calendarItems}
                selectedDate={selectedDate}
                loading={loading}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
