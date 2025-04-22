
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";

interface AttendanceTypeFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export const TeamCalendarEventAttendanceType: React.FC<AttendanceTypeFieldProps> = ({
  value, onChange,
}) => (
  <FormItem className="space-y-3">
    <FormLabel>Attendance Type</FormLabel>
    <FormControl>
      <RadioGroup
        onValueChange={onChange}
        value={value}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="required" id="required" />
          <Label htmlFor="required" className="flex items-center gap-1">
            Required
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="would-like" id="would-like" />
          <Label htmlFor="would-like" className="flex items-center gap-1">
            Would like to attend
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="optional" id="optional" />
          <Label htmlFor="optional" className="flex items-center gap-1">
            Optional
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="info-only" id="info-only" />
          <Label htmlFor="info-only" className="flex items-center gap-1">
            Information only
          </Label>
        </div>
      </RadioGroup>
    </FormControl>
    <FormMessage />
  </FormItem>
);
