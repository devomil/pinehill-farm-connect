
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SpecificDaysSchedulingBarProps {
  selectedDays: string[];
  currentMonth: Date;
  onSchedule: (startTime: string, endTime: string, days: string[]) => void;
  onCancel: () => void;
  onClearSelection: () => void;
}

export const SpecificDaysSchedulingBar: React.FC<SpecificDaysSchedulingBarProps> = ({
  selectedDays,
  currentMonth,
  onSchedule,
  onCancel,
  onClearSelection
}) => {
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  const handleSchedule = () => {
    try {
      if (selectedDays.length === 0) {
        toast.error("No days selected for scheduling");
        return;
      }
      
      // Call the onSchedule callback with the standardized parameter order
      onSchedule(startTime, endTime, selectedDays);
    } catch (error) {
      console.error("Error in specific days scheduling:", error);
      toast.error("Failed to schedule shifts");
    }
  };

  return (
    <div className="bg-green-50 p-3 rounded-md mb-4 flex justify-between items-center flex-wrap gap-4 border border-green-300">
      <div>
        <h3 className="font-medium">
          Add Shifts for Selected Days
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedDays.length} {selectedDays.length === 1 ? "day" : "days"} selected in {currentMonth.toLocaleString('default', { month: 'long' })}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="startTimeSpecific">Start Time</Label>
          <Input
            id="startTimeSpecific"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-24 pointer-events-auto"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTimeSpecific">End Time</Label>
          <Input
            id="endTimeSpecific"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-24 pointer-events-auto"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="pointer-events-auto"
          >
            Clear Selection
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="pointer-events-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="pointer-events-auto"
            variant="default"
          >
            Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};
