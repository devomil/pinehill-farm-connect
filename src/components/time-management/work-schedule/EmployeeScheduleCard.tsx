import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { WorkSchedule } from "@/types/workSchedule";
import { format, startOfToday, endOfToday, isWithinInterval, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePrintSchedule } from "@/contexts/timeManagement/hooks";

interface EmployeeScheduleCardProps {
  schedule: WorkSchedule | null;
  loading: boolean;
  clickable?: boolean;
  viewAllUrl?: string;
}

export const EmployeeScheduleCard: React.FC<EmployeeScheduleCardProps> = ({
  schedule,
  loading,
  clickable = false,
  viewAllUrl,
}) => {
  const { printSchedule } = usePrintSchedule();
  
  // Get today's shifts
  const todayShifts = React.useMemo(() => {
    if (!schedule) return [];
    
    const today = startOfToday();
    const todayEnd = endOfToday();
    const todayDateStr = format(today, "yyyy-MM-dd");
    
    return schedule.shifts.filter(shift => 
      shift.date === todayDateStr
    );
  }, [schedule]);

  // Get upcoming shifts (next 3 days excluding today)
  const upcomingShifts = React.useMemo(() => {
    if (!schedule) return [];
    
    const today = startOfToday();
    const filterInterval = {
      start: today, 
      end: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000) // next 4 days
    };
    
    return schedule.shifts
      .filter(shift => {
        const shiftDate = parseISO(shift.date);
        return isWithinInterval(shiftDate, filterInterval) && 
               format(shiftDate, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd");
      })
      .slice(0, 3); // Get only the first 3
  }, [schedule]);

  const handlePrint = () => {
    if (schedule) {
      printSchedule(schedule, {});  // Add an empty object as second argument
    }
  };
  
  const WrapperComponent = clickable && viewAllUrl ? Link : React.Fragment;
  const wrapperProps = clickable && viewAllUrl ? { to: viewAllUrl, className: "block" } : {};
  
  return (
    <Card className={clickable ? "hover:bg-accent/10 transition-colors" : ""}>
      <WrapperComponent {...wrapperProps}>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-lg">Work Schedule</CardTitle>
              <CardDescription>Your upcoming shifts</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrint();
              }}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
      </WrapperComponent>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !schedule || (todayShifts.length === 0 && upcomingShifts.length === 0) ? (
          <div className="text-center p-4 text-muted-foreground">
            No upcoming shifts scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {todayShifts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Today</h3>
                </div>
                <div className="space-y-2">
                  {todayShifts.map((shift, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                      </span>
                      {shift.isRecurring && (
                        <Badge variant="outline" className="ml-auto">Recurring</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {upcomingShifts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Upcoming</h3>
                </div>
                <div className="space-y-2">
                  {upcomingShifts.map((shift, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {format(parseISO(shift.date), "EEE, MMM d")}
                        </span>
                        <span className="text-xs">
                          {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                        </span>
                      </div>
                      {shift.isRecurring && (
                        <Badge variant="outline" className="ml-auto">Recurring</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {clickable && viewAllUrl && (
        <CardFooter className="pt-0">
          <Link to={viewAllUrl} className="w-full">
            <Button variant="outline" className="w-full" size="sm">
              View Full Schedule
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
