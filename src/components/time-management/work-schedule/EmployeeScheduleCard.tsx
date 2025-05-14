
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkSchedule } from "@/types/workSchedule";
import { format, parse, isSameDay, startOfToday, endOfWeek, isSameMonth } from "date-fns";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrintSchedule } from "@/contexts/timeManagement/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

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
  viewAllUrl = "/time?tab=work-schedules"
}) => {
  const today = startOfToday();
  const endOfCurrentWeek = endOfWeek(today);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { printEmployeeSchedule } = usePrintSchedule();
  
  // Find upcoming shifts (today and this week)
  const upcomingShifts = React.useMemo(() => {
    if (!schedule || !schedule.shifts) return [];
    
    return schedule.shifts
      .filter(shift => {
        const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
        return (
          // Show shifts that are today or upcoming this week
          (shiftDate >= today && shiftDate <= endOfCurrentWeek)
        );
      })
      .sort((a, b) => {
        // Sort by date and then by start time
        const dateA = parse(a.date, "yyyy-MM-dd", new Date());
        const dateB = parse(b.date, "yyyy-MM-dd", new Date());
        
        if (isSameDay(dateA, dateB)) {
          return a.startTime.localeCompare(b.startTime);
        }
        
        return dateA.getTime() - dateB.getTime();
      });
  }, [schedule, today, endOfCurrentWeek]);

  // Get this month's total scheduled days
  const monthlyScheduleCount = React.useMemo(() => {
    if (!schedule || !schedule.shifts) return 0;
    
    const currentDate = new Date();
    const uniqueDays = new Set();
    
    schedule.shifts.forEach(shift => {
      const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
      if (isSameMonth(shiftDate, currentDate)) {
        uniqueDays.add(shift.date);
      }
    });
    
    return uniqueDays.size;
  }, [schedule]);
  
  const handleClick = (e: React.MouseEvent) => {
    if (clickable && viewAllUrl) {
      navigate(viewAllUrl);
    }
  };
  
  const handlePrintSchedule = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    printEmployeeSchedule(schedule, currentUser);
  };
  
  // Format time display for readability
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Card 
      className={clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={clickable ? handleClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            My Work Schedule
          </CardTitle>
          {monthlyScheduleCount > 0 && (
            <Badge variant="outline" className="bg-primary/5">
              {monthlyScheduleCount} days this month
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-6 bg-muted rounded w-2/3"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        ) : upcomingShifts.length > 0 ? (
          <div className="space-y-3">
            {upcomingShifts.slice(0, 3).map((shift, index) => {
              const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
              const isToday = isSameDay(shiftDate, today);
              
              return (
                <div key={index} className="flex justify-between items-center p-2 rounded-md bg-accent/10">
                  <div>
                    <div className="font-medium flex items-center">
                      {isToday ? (
                        <span className="text-primary">Today</span>
                      ) : (
                        format(shiftDate, "EEE, MMM d")
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </div>
                  </div>
                  {shift.notes && (
                    <div className="text-xs bg-background px-2 py-1 rounded">
                      {shift.notes.length > 15 ? shift.notes.substring(0, 15) + '...' : shift.notes}
                    </div>
                  )}
                </div>
              );
            })}
            
            {upcomingShifts.length > 3 && (
              <div className="text-sm text-center text-muted-foreground pt-2">
                +{upcomingShifts.length - 3} more shifts this week
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No scheduled shifts for this week</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {clickable && (
          <Button variant="ghost" size="sm" onClick={handleClick}>
            View Full Schedule
          </Button>
        )}
        {schedule && schedule.shifts && schedule.shifts.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintSchedule}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print My Schedule
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
