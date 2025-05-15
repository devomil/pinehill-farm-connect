
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, addMonths, subMonths } from "date-fns";
import { CalendarNavigation } from "@/components/calendar/CalendarNavigation";
import { CalendarDay } from "@/components/calendar/CalendarDay";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { useTimeManagement } from "@/contexts/timeManagement";
import { User } from "@/types";

interface ScheduleWidgetProps {
  currentUser: User;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [includeDeclinedRequests, setIncludeDeclinedRequests] = useState<boolean>(false);
  const { timeOffRequests } = useTimeManagement();
  
  // Use our calendar events hook to get all calendar items
  const { calendarEvents } = useCalendarEvents(
    currentUser,
    currentMonth,
    includeDeclinedRequests,
    timeOffRequests || []
  );
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const handleDaySelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>View team schedules and time-off</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="showDeclinedRequests"
              checked={includeDeclinedRequests}
              onChange={(e) => setIncludeDeclinedRequests(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="showDeclinedRequests" className="text-sm text-muted-foreground">
              Show Declined
            </label>
          </div>
          <CalendarNavigation
            currentMonth={currentMonth}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          month={currentMonth}
          className="rounded-md border"
          components={{
            Day: (props) => (
              <CalendarDay 
                {...props} 
                eventsMap={calendarEvents}
              />
            )
          }}
        />
        
        <div className="text-center mt-4">
          <Link to="/time-management">
            <Button variant="link" size="sm">
              View Full Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
