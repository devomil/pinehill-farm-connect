
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";

interface SpecificDaySelectorProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  currentMonth: Date;
  onAddShift: () => void;
}

export const SpecificDaySelector: React.FC<SpecificDaySelectorProps> = ({
  selectedDate,
  setSelectedDate,
  currentMonth,
  onAddShift,
}) => {
  return (
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
          onClick={onAddShift}
          className="shrink-0"
          disabled={!selectedDate}
        >
          Add Shift for Selected Day
        </Button>
      </div>
    </div>
  );
};
