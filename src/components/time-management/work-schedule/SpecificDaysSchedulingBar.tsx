
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface SpecificDaysSchedulingBarProps {
  selectedDays: string[];
  currentMonth: Date;
  onSchedule: (days: string[], startTime: string, endTime: string) => void;
  onCancel: () => void;
}

export const SpecificDaysSchedulingBar: React.FC<SpecificDaysSchedulingBarProps> = ({
  selectedDays,
  currentMonth,
  onSchedule,
  onCancel
}) => {
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  const handleSchedule = () => {
    if (selectedDays.length === 0) {
      return;
    }
    
    onSchedule(selectedDays, startTime, endTime);
  };
  
  const monthName = format(currentMonth, 'MMMM yyyy');
  
  return (
    <div className="bg-accent/20 p-3 rounded-md flex justify-between items-center flex-wrap gap-4">
      <div>
        <h3 className="font-medium">
          Add Shifts for {selectedDays.length} Specific Day{selectedDays.length !== 1 ? 's' : ''}
        </h3>
        <p className="text-sm text-muted-foreground">
          Set hours for selected days in {monthName}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-24"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-24"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={selectedDays.length === 0}
          >
            Apply to {selectedDays.length} Day{selectedDays.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};
