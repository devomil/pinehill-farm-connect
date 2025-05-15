
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";

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
}

export const AdminSchedulingToolsBar: React.FC<AdminSchedulingToolsBarProps> = ({
  selectedEmployee,
  currentMonth,
  scheduleData,
  availableEmployees,
  onAssignWeekday,
  onAssignWeekend,
  onCheckConflicts,
  onAutoAssignCoverage
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  
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
    
    const conflicts = await onCheckConflicts(scheduleData.shifts);
    
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
      
      <div className="flex flex-wrap gap-2">
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
