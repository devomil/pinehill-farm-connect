
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShiftDetailsFormProps {
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  onShiftDateChange: (date: string) => void;
  onShiftStartChange: (time: string) => void;
  onShiftEndChange: (time: string) => void;
}

export function ShiftDetailsForm({ 
  shiftDate, 
  shiftStart, 
  shiftEnd,
  onShiftDateChange,
  onShiftStartChange,
  onShiftEndChange
}: ShiftDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="shift-date">Shift Date</Label>
        <Input 
          id="shift-date" 
          type="date" 
          value={shiftDate} 
          onChange={(e) => onShiftDateChange(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shift-start">Start Time</Label>
          <Input 
            id="shift-start" 
            type="time" 
            value={shiftStart} 
            onChange={(e) => onShiftStartChange(e.target.value)} 
          />
        </div>

        <div>
          <Label htmlFor="shift-end">End Time</Label>
          <Input 
            id="shift-end" 
            type="time" 
            value={shiftEnd} 
            onChange={(e) => onShiftEndChange(e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}
