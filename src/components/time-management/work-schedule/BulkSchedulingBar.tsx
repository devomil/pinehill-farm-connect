
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BulkSchedulingBarProps {
  bulkMode: string;
  currentMonth: Date;
  onSchedule: (startTime: string, endTime: string, days: string[]) => void;
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
    try {
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
      
      console.log(`Generated ${days.length} days for bulk scheduling: ${bulkMode}`);
      
      if (days.length === 0) {
        toast.error(`No ${bulkMode} days found in the current month`);
        return;
      }
      
      // Call the onSchedule callback
      onSchedule(startTime, endTime, days);
    } catch (error) {
      console.error("Error in bulk scheduling:", error);
      toast.error("Failed to schedule shifts");
    }
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
            className="w-24 pointer-events-auto"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-24 pointer-events-auto"
          />
        </div>
        
        <div className="flex gap-2">
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
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
