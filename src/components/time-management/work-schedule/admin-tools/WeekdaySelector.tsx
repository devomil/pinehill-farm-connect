
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface WeekdaySelectorProps {
  selectedDays: number[];
  toggleDay: (day: number) => void;
}

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  selectedDays,
  toggleDay,
}) => {
  return (
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
  );
};
