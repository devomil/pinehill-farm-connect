
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BulkSchedulingBarProps {
  bulkMode: string;
  currentMonth: Date;
  onSchedule: (days: string[], startTime: string, endTime: string) => void;
  onCancel: () => void;
}

export const BulkSchedulingBar: React.FC<BulkSchedulingBarProps> = ({
  bulkMode,
  currentMonth,
  onSchedule,
  onCancel
}) => {
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  const handleSchedule = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const days: string[] = [];
    
    // Create array of dates based on the bulk mode
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      if (bulkMode === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
      } else if (bulkMode === "weekend" && (dayOfWeek === 0 || dayOfWeek === 6)) {
        days.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
      }
    }
    
    onSchedule(days, startTime, endTime);
  };
  
  return (
    <div className="bg-accent/20 p-3 rounded-md flex justify-between items-center flex-wrap gap-4">
      <div>
        <h3 className="font-medium">
          {bulkMode === "weekdays" ? "Add Weekday Shifts" : "Add Weekend Shifts"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Set hours for {bulkMode === "weekdays" ? "all weekdays" : "all weekend days"} in {currentMonth.toLocaleString('default', { month: 'long' })}
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
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
