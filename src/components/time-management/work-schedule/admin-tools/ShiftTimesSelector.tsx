
import React from "react";
import { Input } from "@/components/ui/input";

interface ShiftTimesSelectorProps {
  startTime: string;
  endTime: string;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
}

export const ShiftTimesSelector: React.FC<ShiftTimesSelectorProps> = ({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) => {
  return (
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
  );
};
