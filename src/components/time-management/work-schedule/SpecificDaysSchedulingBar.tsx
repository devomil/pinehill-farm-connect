
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  const handleSchedule = () => {
    if (selectedDays.length === 0) {
      return;
    }
    onSchedule(startTime, endTime, selectedDays);
  };
  
  // Format days for display
  const formatSelectedDays = () => {
    if (selectedDays.length === 0) {
      return "No days selected";
    } else if (selectedDays.length <= 3) {
      return selectedDays.join(", ");
    } else {
      return `${selectedDays.length} days selected`;
    }
  };
  
  return (
    <Card className="p-4 mb-4 bg-orange-50 border-orange-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-orange-900">Scheduling for Specific Days</h3>
        <div className="text-sm text-orange-700">
          {formatSelectedDays()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="start-time" className="text-sm font-medium whitespace-nowrap">
            Start Time:
          </label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="end-time" className="text-sm font-medium whitespace-nowrap">
            End Time:
          </label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            size="sm" 
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSchedule}
            disabled={selectedDays.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Schedule Selected Days
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded-md">
        <strong>Tip:</strong> Click on calendar days above to select them. You can select multiple days for scheduling.
      </div>
    </Card>
  );
};
