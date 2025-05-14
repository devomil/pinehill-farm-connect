
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useWorkSchedule } from "./useWorkSchedule";
import { format, parse, isSameDay, startOfToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { usePrintSchedule } from "@/contexts/timeManagement/hooks";

export const AdminEmployeeScheduleCard: React.FC<{ clickable?: boolean; viewAllUrl?: string }> = ({
  clickable = false,
  viewAllUrl = "/time?tab=work-schedules"
}) => {
  const navigate = useNavigate();
  const { employees } = useEmployeeDirectory();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const { scheduleData, loading } = useWorkSchedule(selectedEmployee);
  const { printEmployeeSchedule } = usePrintSchedule();
  const today = startOfToday();

  // Set first employee as default when loaded
  useEffect(() => {
    if (employees && employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0].id);
    }
  }, [employees, selectedEmployee]);

  // Get current employee
  const currentEmployee = employees?.find(emp => emp.id === selectedEmployee);

  const handleClick = () => {
    if (clickable && viewAllUrl) {
      navigate(viewAllUrl);
    }
  };

  // Format shift time for display
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

  // Find today's shifts for quick view
  const todayShifts = React.useMemo(() => {
    if (!scheduleData || !scheduleData.shifts) return [];
    
    return scheduleData.shifts
      .filter(shift => {
        const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
        return isSameDay(shiftDate, today);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [scheduleData, today]);
  
  // Get upcoming shifts (next 5 days)
  const upcomingShifts = React.useMemo(() => {
    if (!scheduleData || !scheduleData.shifts) return [];
    
    return scheduleData.shifts
      .filter(shift => {
        const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
        // Not today, but in the next 5 days
        return !isSameDay(shiftDate, today) && 
               shiftDate > today && 
               shiftDate <= new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      })
      .sort((a, b) => {
        const dateA = parse(a.date, "yyyy-MM-dd", new Date());
        const dateB = parse(b.date, "yyyy-MM-dd", new Date());
        
        if (isSameDay(dateA, dateB)) {
          return a.startTime.localeCompare(b.startTime);
        }
        
        return dateA.getTime() - dateB.getTime();
      });
  }, [scheduleData, today]);

  const handlePrintSchedule = () => {
    if (currentEmployee && scheduleData) {
      printEmployeeSchedule(scheduleData, currentEmployee);
    }
  };

  return (
    <Card 
      className={cn(
        "h-full", 
        clickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      )}
      onClick={clickable ? handleClick : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Employee Schedules
          </CardTitle>
          {employees && employees.length > 0 && (
            <Select
              value={selectedEmployee || ""}
              onValueChange={(value) => {
                setSelectedEmployee(value);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px]" onClick={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent onClick={(e) => e.stopPropagation()}>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !currentEmployee || !scheduleData ? (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="mx-auto h-8 w-8 opacity-30 mb-2" />
            <p>{employees?.length ? "Select an employee to view their schedule" : "No employees found"}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Today's Schedule:</h3>
              {todayShifts.length > 0 ? (
                <div className="bg-accent/10 p-2 rounded-md">
                  {todayShifts.map((shift, i) => (
                    <div key={i} className="text-sm">
                      <strong>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</strong>
                      {shift.notes && <span className="text-xs ml-2 text-muted-foreground">{shift.notes}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No shifts scheduled for today</div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Upcoming Shifts:</h3>
              {upcomingShifts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingShifts.slice(0, 3).map((shift, i) => (
                      <TableRow key={i}>
                        <TableCell>{format(parse(shift.date, "yyyy-MM-dd", new Date()), "MMM d, E")}</TableCell>
                        <TableCell>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-muted-foreground">No upcoming shifts scheduled</div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {clickable && (
          <Button variant="ghost" size="sm" onClick={handleClick}>
            Manage Schedules
          </Button>
        )}
        {currentEmployee && scheduleData && scheduleData.shifts && scheduleData.shifts.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handlePrintSchedule();
            }}
            disabled={loading}
          >
            Print Schedule
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
