
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { X, Calendar as CalendarIcon, CheckSquare } from "lucide-react";

interface SpecificDaysSchedulingBarProps {
  selectedDays: string[];
  currentMonth: Date;
  onSchedule: (days: string[], startTime: string, endTime: string) => void;
  onCancel: () => void;
  onClearSelection?: () => void;
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
    if (selectedDays.length === 0) return;
    console.log("Scheduling for days:", selectedDays);
    onSchedule(selectedDays, startTime, endTime);
  };
  
  const monthLabel = format(currentMonth, "MMMM yyyy");

  // Log selected days whenever they change
  React.useEffect(() => {
    console.log("SpecificDaysSchedulingBar - Selected days:", selectedDays);
  }, [selectedDays]);
  
  return (
    <Card className="p-4 mb-4 bg-accent/20 border border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">
              {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected in {monthLabel}
            </span>
          </div>
          
          {selectedDays.length > 0 && onClearSelection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearSelection}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-24 pointer-events-auto"
            />
            <span>to</span>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-24 pointer-events-auto"
            />
          </div>
          
          <Button 
            variant="default" 
            className="ml-2 pointer-events-auto"
            disabled={selectedDays.length === 0}
            onClick={handleSchedule}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Assign Shifts
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
            aria-label="Cancel"
            className="pointer-events-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
