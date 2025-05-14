
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useDaySelector } from "@/contexts/timeManagement/hooks/useDaySelector";
import { uuid } from "@/utils/uuid";
import { WorkScheduleCalendar } from "@/components/time-management/work-schedule/WorkScheduleCalendar";
import { User } from "@/types";

interface ShiftCoverageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
}

export const ShiftCoverageDialog: React.FC<ShiftCoverageDialogProps> = ({
  open,
  onOpenChange,
  currentUser,
  allEmployees,
  onRequestSent
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const { 
    toggleDay, 
    isDaySelected, 
    getSelectedDaysArray,
    clearSelectedDays
  } = useDaySelector(currentMonth);

  const handleConfirm = () => {
    const selectedDays = getSelectedDaysArray();
    if (selectedDays.length === 0) return;
    
    // This would typically call an API to save the schedule
    console.log("Scheduled shifts for:", {
      currentUser,
      selectedDays,
      startTime,
      endTime
    });
    
    onRequestSent();
    clearSelectedDays();
    onOpenChange(false);
  };

  const handleCancel = () => {
    clearSelectedDays();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Shift Coverage</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select specific days for which you need shift coverage. Click on multiple dates to select them.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="border rounded-md p-3">
            <WorkScheduleCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              shiftsMap={new Map()}
              selectedDate={undefined}
              setSelectedDate={() => {}}
              onDateSelected={() => {}}
              onShiftClick={() => {}}
              selectionMode="multiple"
              isDaySelected={isDaySelected}
              onDayToggle={toggleDay}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm">
              {getSelectedDaysArray().length} day(s) selected
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={getSelectedDaysArray().length === 0}
              >
                Request Coverage
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
