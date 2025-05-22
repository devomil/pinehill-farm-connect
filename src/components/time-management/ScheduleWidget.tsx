
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { useTimeManagement } from "@/contexts/timeManagement";
import { User } from "@/types";
import { GripVertical } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";
import { WorkScheduleCalendar } from "./work-schedule/WorkScheduleCalendar";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleWidgetProps {
  currentUser?: User;
  className?: string;
  isCustomizing?: boolean;
  allEmployeeShifts?: Map<string, WorkShift[]>;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ 
  currentUser, 
  className, 
  isCustomizing = false,
  allEmployeeShifts
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [includeDeclinedRequests, setIncludeDeclinedRequests] = useState<boolean>(false);
  const { timeOffRequests = [] } = useTimeManagement();
  const { currentUser: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";
  
  // Use our calendar events hook to get all calendar items
  const { calendarEvents, shiftsMap } = useCalendarEvents(
    currentUser,
    currentMonth,
    includeDeclinedRequests,
    timeOffRequests || []
  );
  
  // Debug: Log the widget mount and its state
  useEffect(() => {
    console.log("ScheduleWidget - mounted with:", {
      currentMonth: format(currentMonth, "MMMM yyyy"),
      selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "None",
      eventsCount: calendarEvents?.size || 0,
      isCustomizing,
      hasShifts: allEmployeeShifts ? allEmployeeShifts.size : 0,
      currentUser: currentUser ? currentUser.id : "undefined"
    });
  }, [currentMonth, selectedDate, calendarEvents, isCustomizing, allEmployeeShifts, currentUser]);

  return (
    <Card className={cn("mt-4 relative group", className, isCustomizing ? "border-2 border-dashed border-blue-300" : "")}>
      {isCustomizing && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-medium rounded">
          <GripVertical className="h-4 w-4 inline-block mr-1" /> Drag to move
        </div>
      )}
      
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
        </div>
      </CardHeader>
      <CardContent>
        <WorkScheduleCalendar 
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          shiftsMap={allEmployeeShifts || shiftsMap}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isAdminView={isAdmin}
          showEmployeeNames={true}
        />
        
        <div className="text-center mt-4">
          <Link to="/time?tab=team-calendar">
            <Button variant="accent" size="sm" className="w-full">
              View Full Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}
