
import React, { useMemo, useState } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface EmployeeScheduleViewProps {
  scheduleData: WorkSchedule | null;
  loading: boolean;
}

export const EmployeeScheduleView: React.FC<EmployeeScheduleViewProps> = ({
  scheduleData,
  loading
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // Get all days in the current month
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate]);
  
  // Get shifts for each day
  const shiftsMap = useMemo(() => {
    if (!scheduleData || !scheduleData.shifts) return new Map();
    
    const map = new Map();
    scheduleData.shifts.forEach(shift => {
      const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
      const dateKey = format(shiftDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(shift);
    });
    return map;
  }, [scheduleData]);
  
  // Custom Day content rendering
  const renderDayContent = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const shifts = shiftsMap.get(dateStr) || [];
    
    return (
      <div className="h-full w-full">
        <div className="text-right text-xs">{format(day, "d")}</div>
        {shifts.length > 0 && (
          <div className="mt-1 bg-primary/10 text-xs p-1 rounded">
            {shifts.map((shift, index) => (
              <div key={index} className="truncate">
                {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Handle day click to view details
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    
    const dateStr = format(day, "yyyy-MM-dd");
    const existingShifts = shiftsMap.get(dateStr) || [];
    
    if (existingShifts.length > 0) {
      setIsDialogOpen(true);
    }
  };
  
  // Navigate between months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Get classes for each day in the calendar
  const getDayClass = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const hasShifts = shiftsMap.has(dateStr);
    
    return {
      "bg-primary/5": hasShifts,
      "cursor-pointer hover:bg-accent": hasShifts
    };
  };
  
  if (loading) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading your schedule...
      </div>
    );
  }
  
  if (!scheduleData || !scheduleData.shifts || scheduleData.shifts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No schedule has been set for this month
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={goToPreviousMonth} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <h3 className="font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
        <Button variant="ghost" onClick={goToNextMonth} size="sm">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default"
          month={currentDate}
          onDayClick={handleDayClick}
          components={{
            Day: ({ day, ...props }: any) => (
              <div
                {...props}
                className={`h-20 w-full border rounded-md p-1 ${
                  Object.entries(getDayClass(day))
                    .filter(([, value]) => value)
                    .map(([className]) => className)
                    .join(" ")
                }`}
                onClick={() => handleDayClick(day)}
              >
                {renderDayContent(day)}
              </div>
            ),
          }}
          className="w-full"
        />
      </div>
      
      {/* Shift Details Dialog */}
      {selectedDate && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Schedule for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                {selectedDate && (
                  <>
                    {(shiftsMap.get(format(selectedDate, "yyyy-MM-dd")) || []).map((shift, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-2">
                        <div className="font-medium">
                          Shift {index + 1}: {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                        </div>
                        {shift.isRecurring && (
                          <div className="text-sm bg-primary/10 inline-block px-2 py-1 rounded">
                            Weekly recurring
                          </div>
                        )}
                        {shift.notes && (
                          <div className="text-sm mt-2">
                            <div className="font-medium">Notes:</div>
                            <p className="text-muted-foreground">{shift.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
