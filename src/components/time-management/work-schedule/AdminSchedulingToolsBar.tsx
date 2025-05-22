import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfMonth, endOfMonth, isValid } from "date-fns";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import { Calendar, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface AdminSchedulingToolsBarProps {
  selectedEmployee: string;
  currentMonth: Date;
  scheduleData: WorkSchedule | null;
  availableEmployees: User[];
  onAssignWeekday: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    daysToInclude: number[]
  ) => void;
  onAssignWeekend: (
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string
  ) => void;
  onCheckConflicts: (shifts: WorkShift[]) => Promise<string[]>;
  onAutoAssignCoverage: (
    gapDate: string,
    startTime: string,
    endTime: string,
    availableEmployees: User[]
  ) => Promise<WorkShift | null>;
  onAddSpecificDayShift?: (
    employeeId: string,
    date: Date,
    startTime: string,
    endTime: string
  ) => void;
}

export const AdminSchedulingToolsBar: React.FC<AdminSchedulingToolsBarProps> = ({
  selectedEmployee,
  currentMonth,
  scheduleData,
  availableEmployees,
  onAssignWeekday,
  onAssignWeekend,
  onCheckConflicts,
  onAutoAssignCoverage,
  onAddSpecificDayShift
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Month range for scheduling
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const handleAssignWeekday = () => {
    if (!selectedDays.length) {
      toast({
        description: "Please select at least one weekday",
        variant: "destructive"
      });
      return;
    }
    
    onAssignWeekday(
      selectedEmployee,
      monthStart,
      monthEnd,
      startTime,
      endTime,
      selectedDays
    );
  };
  
  const handleAssignWeekend = () => {
    onAssignWeekend(
      selectedEmployee,
      monthStart,
      monthEnd,
      startTime,
      endTime
    );
  };
  
  const handleCheckConflicts = async () => {
    if (!scheduleData) {
      toast({
        description: "No schedule data available",
        variant: "destructive"
      });
      return;
    }
    
    // Updated to pass the selectedEmployee as the first parameter
    const conflicts = await onCheckConflicts(selectedEmployee, scheduleData.shifts);
    
    if (conflicts.length === 0) {
      toast({
        description: "No time-off conflicts found in the schedule",
        variant: "success"
      });
    }
  };
  
  const handleAutoAssignCoverage = async () => {
    // For demo purposes, we'll just use the current date
    const today = format(new Date(), "yyyy-MM-dd");
    
    const result = await onAutoAssignCoverage(
      today,
      startTime,
      endTime,
      availableEmployees.filter(emp => emp.id !== selectedEmployee)
    );
    
    if (result) {
      toast({
        description: "Coverage auto-assigned successfully",
        variant: "success"
      });
    }
  };
  
  const handleAddSpecificDayShift = () => {
    if (!selectedDate || !isValid(selectedDate)) {
      toast({
        description: "Please select a specific day",
        variant: "destructive"
      });
      return;
    }

    if (onAddSpecificDayShift) {
      onAddSpecificDayShift(
        selectedEmployee,
        selectedDate,
        startTime,
        endTime
      );
      
      toast({
        description: `Shift added for ${format(selectedDate, "MMMM d, yyyy")}`,
        variant: "success"
      });
      
      // Reset the selected date after adding
      setSelectedDate(undefined);
    }
  };
  
  const toggleDay = (day: number) => {
    setSelectedDays(current => {
      if (current.includes(day)) {
        return current.filter(d => d !== day);
      } else {
        return [...current, day];
      }
    });
  };
  
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Admin Scheduling Tools</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Shift Times</label>
          <div className="flex space-x-2">
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-32"
            />
            <span className="self-center">to</span>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-32"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Weekdays to Include</label>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="monday" 
                checked={selectedDays.includes(1)} 
                onCheckedChange={() => toggleDay(1)}
              />
              <label htmlFor="monday" className="text-sm">Mon</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tuesday" 
                checked={selectedDays.includes(2)} 
                onCheckedChange={() => toggleDay(2)}
              />
              <label htmlFor="tuesday" className="text-sm">Tue</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="wednesday" 
                checked={selectedDays.includes(3)} 
                onCheckedChange={() => toggleDay(3)}
              />
              <label htmlFor="wednesday" className="text-sm">Wed</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="thursday" 
                checked={selectedDays.includes(4)} 
                onCheckedChange={() => toggleDay(4)}
              />
              <label htmlFor="thursday" className="text-sm">Thu</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="friday" 
                checked={selectedDays.includes(5)} 
                onCheckedChange={() => toggleDay(5)}
              />
              <label htmlFor="friday" className="text-sm">Fri</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Specific Day Selection */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Specific Day Scheduling</h4>
        <div className="flex flex-wrap md:flex-nowrap gap-2 items-end">
          <div className="space-y-1 w-full md:w-auto">
            <label className="text-sm font-medium">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`w-full md:w-[240px] justify-start text-left font-normal ${!selectedDate ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  month={currentMonth}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleAddSpecificDayShift}
            className="shrink-0"
            disabled={!selectedDate}
          >
            Add Shift for Selected Day
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button size="sm" onClick={handleAssignWeekday}>
          Assign Weekday Shifts
        </Button>
        <Button size="sm" onClick={handleAssignWeekend}>
          Assign Weekend Shifts
        </Button>
        <Button size="sm" variant="outline" onClick={handleCheckConflicts}>
          Check Time-Off Conflicts
        </Button>
        <Button size="sm" variant="outline" onClick={handleAutoAssignCoverage}>
          Auto-Assign Coverage
        </Button>
      </div>
    </Card>
  );
};
