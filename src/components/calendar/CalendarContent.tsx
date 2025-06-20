
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarViewSelector } from "./CalendarViewSelector";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTimeManagement } from "@/contexts/timeManagement";
import { CalendarDay } from "./CalendarDay";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from "date-fns";
import { CalendarLegend } from "./CalendarLegend";

interface CalendarContentProps {
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  currentUser: User;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  clickable?: boolean;
  viewAllUrl?: string;
}

export function CalendarContent({
  date,
  currentMonth,
  viewMode,
  currentUser,
  onDateSelect,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  clickable = false,
  viewAllUrl,
}: CalendarContentProps) {
  // Only try to access the TimeManagement context if we have a currentUser
  // This prevents errors when the context is not available
  const timeManagementContext = useTimeManagement();
  const timeOffRequests = timeManagementContext?.timeOffRequests || [];
  const [includeDeclinedRequests, setIncludeDeclinedRequests] = useState<boolean>(false);
  
  // Use our custom hook to manage calendar events
  const { calendarEvents } = useCalendarEvents(
    currentUser,
    currentMonth,
    includeDeclinedRequests,
    timeOffRequests
  );

  // Debug: Log the current month and date to verify
  useEffect(() => {
    console.log("CalendarContent: Current month", format(currentMonth, "MMMM yyyy"));
    console.log("CalendarContent: Selected date", date ? format(date, "yyyy-MM-dd") : "None");
    
    // Calculate and log days in the current month to verify they're generated
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    console.log(`CalendarContent: Month has ${days.length} days`);
  }, [currentMonth, date]);

  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };

  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            View team schedules and time-off
          </CardDescription>
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
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as "month" | "team")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="month">Work Schedule</TabsTrigger>
            <TabsTrigger value="team">Company Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month" className="mt-0">
            <div className="border rounded-md p-3 pointer-events-auto">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                month={currentMonth}
                className="rounded-md"
                components={{
                  Day: (props) => (
                    <CalendarDay 
                      {...props} 
                      eventsMap={calendarEvents}
                    />
                  )
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="mt-0">
            <TeamCalendar currentUser={currentUser} />
          </TabsContent>
        </Tabs>
        
        <CalendarLegend />
        
        {viewAllUrl && (
          <div className="text-center mt-4">
            <Link to={viewAllUrl} onClick={handleButtonClick}>
              <Button variant="link" size="sm">
                View Full Calendar
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
