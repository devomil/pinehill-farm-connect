
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarViewSelector } from "./CalendarViewSelector";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useTimeManagement } from "@/contexts/timeManagement";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkShift } from "@/types/workSchedule";
import { TimeOffRequest } from "@/types/timeManagement";
import { DayProps } from "react-day-picker";

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

// Function to get date string in YYYY-MM-DD format
const getDateKey = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

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
  const { timeOffRequests } = useTimeManagement();
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [shiftCoverage, setShiftCoverage] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Map<string, {
    timeOff: TimeOffRequest[],
    shifts: WorkShift[],
    shiftCoverage: any[]
  }>>(new Map());

  // Fetch work schedules for the month view
  useEffect(() => {
    const fetchWorkSchedules = async () => {
      const monthStr = format(currentMonth, "yyyy-MM");
      
      try {
        // Use specific table name and structure that exists in Supabase
        const { data, error } = await supabase
          .from('shift_coverage_requests')
          .select('*')
          .eq('original_employee_id', currentUser.id);
          
        if (error) {
          console.error('Error fetching shift data:', error);
        } else if (data) {
          // Process the data differently since we're not using work_schedules table
          // This is a temporary approach until we have proper work schedules table
          const formattedShifts: WorkShift[] = data.map(item => ({
            id: item.id,
            employeeId: item.original_employee_id,
            date: item.shift_date,
            startTime: item.shift_start,
            endTime: item.shift_end,
            isRecurring: false,
            notes: `Shift coverage: ${item.status}`
          }));
          setShifts(formattedShifts);
        }
      } catch (error) {
        console.error('Error in fetch:', error);
      }
    };

    const fetchShiftCoverage = async () => {
      try {
        const { data, error } = await supabase
          .from('shift_coverage_requests')
          .select('*')
          .or(`original_employee_id.eq.${currentUser.id},covering_employee_id.eq.${currentUser.id}`);
          
        if (error) {
          console.error('Error fetching shift coverage:', error);
        } else {
          setShiftCoverage(data || []);
        }
      } catch (error) {
        console.error('Error in shift coverage fetch:', error);
      }
    };

    fetchWorkSchedules();
    fetchShiftCoverage();
  }, [currentUser.id, currentMonth]);

  // Process all events for the calendar
  useEffect(() => {
    const eventsMap = new Map<string, {
      timeOff: TimeOffRequest[],
      shifts: WorkShift[],
      shiftCoverage: any[]
    }>();
    
    // Add time off requests
    if (timeOffRequests) {
      timeOffRequests.forEach(request => {
        const startDate = new Date(request.start_date);
        const endDate = new Date(request.end_date);
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateKey = getDateKey(currentDate);
          const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
          currentEvents.timeOff.push(request);
          eventsMap.set(dateKey, currentEvents);
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }
    
    // Add work shifts
    shifts.forEach(shift => {
      const dateKey = shift.date;
      const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
      currentEvents.shifts.push(shift);
      eventsMap.set(dateKey, currentEvents);
    });
    
    // Add shift coverage
    shiftCoverage.forEach(coverage => {
      const dateKey = coverage.shift_date;
      const currentEvents = eventsMap.get(dateKey) || { timeOff: [], shifts: [], shiftCoverage: [] };
      currentEvents.shiftCoverage.push(coverage);
      eventsMap.set(dateKey, currentEvents);
    });
    
    setCalendarEvents(eventsMap);
  }, [timeOffRequests, shifts, shiftCoverage]);

  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };
  
  // Render day contents for the calendar
  const renderDay = (day: Date | undefined) => {
    if (!day) return null;
    
    const dateKey = getDateKey(day);
    const events = calendarEvents.get(dateKey);
    
    if (!events) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1">
        {events.timeOff.length > 0 && (
          <Badge variant="outline" className="bg-blue-100 text-xs px-1">Time Off</Badge>
        )}
        {events.shifts.length > 0 && (
          <Badge variant="outline" className="bg-green-100 text-xs px-1">Shift</Badge>
        )}
        {events.shiftCoverage.length > 0 && (
          <Badge variant="outline" className="bg-amber-100 text-xs px-1">Coverage</Badge>
        )}
      </div>
    );
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
        <CalendarNavigation
          currentMonth={currentMonth}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as "month" | "team")}>
          <CalendarViewSelector
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
          
          <TabsContent value="month" className="mt-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateSelect}
              month={currentMonth}
              className="rounded-md border"
              components={{
                Day: ({ date: dayDate, ...props }) => (
                  <div className="relative h-full">
                    {/* Use the spread operator to pass all props to the div */}
                    <div {...props} />
                    {dayDate && renderDay(dayDate)}
                  </div>
                )
              }}
            />
          </TabsContent>
          
          <TabsContent value="team" className="mt-0">
            <TeamCalendar currentUser={currentUser} />
          </TabsContent>
        </Tabs>
        
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
