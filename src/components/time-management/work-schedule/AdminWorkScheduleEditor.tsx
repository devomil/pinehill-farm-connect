
import React, { useState, useMemo } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface AdminWorkScheduleEditorProps {
  selectedEmployee: string | null;
  scheduleData: WorkSchedule | null;
  onSave: (schedule: WorkSchedule) => void;
  onReset: () => void;
  loading: boolean;
}

export const AdminWorkScheduleEditor: React.FC<AdminWorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  
  const month = format(currentDate, "yyyy-MM");
  
  // Get all days in the current month
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate]);
  
  // Get shifts for each day
  const shiftsMap = useMemo(() => {
    if (!scheduleData || !scheduleData.shifts) return new Map();
    
    const map = new Map();
    scheduleData.shifts.forEach(shift => {
      const shiftDate = parse(shift.date, "yyyy-MM-dd", new Date());
      const dateKey = format(shiftDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(shift);
    });
    return map;
  }, [scheduleData]);
  
  // Custom Day content rendering
  const renderDayContent = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const shifts = shiftsMap.get(dateStr) || [];
    
    return (
      <div className="h-full w-full">
        <div className="text-right text-xs">{format(day, "d")}</div>
        {shifts.length > 0 && (
          <div className="mt-1 bg-primary/10 text-xs p-1 rounded">
            {shifts.length} shift{shifts.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };
  
  // Handle day click
  const handleDayClick = (day: Date) => {
    if (isSelectingMultiple) {
      // Toggle selection of multiple dates
      const isAlreadySelected = selectedDates.some(d => isSameDay(d, day));
      if (isAlreadySelected) {
        setSelectedDates(selectedDates.filter(d => !isSameDay(d, day)));
      } else {
        setSelectedDates([...selectedDates, day]);
      }
    } else {
      // Single date selection - open dialog for scheduling
      setSelectedDate(day);
      
      const dateStr = format(day, "yyyy-MM-dd");
      const existingShifts = shiftsMap.get(dateStr) || [];
      
      if (existingShifts.length > 0) {
        // If shifts exist, show the first one in the dialog
        setCurrentShift({ ...existingShifts[0] });
      } else {
        // Create a new shift
        setCurrentShift({
          id: uuidv4(),
          employeeId: selectedEmployee || "",
          date: dateStr,
          startTime: "09:00",
          endTime: "17:00",
          isRecurring: false,
          notes: ""
        });
      }
      
      setIsDialogOpen(true);
    }
  };
  
  // Save shift from dialog
  const saveShift = () => {
    if (!currentShift || !selectedEmployee || !scheduleData) return;
    
    // Validate times
    if (currentShift.startTime >= currentShift.endTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    let newSchedule: WorkSchedule;
    
    // If this is for multiple dates
    if (isSelectingMultiple && selectedDates.length > 0) {
      const newShifts = [...(scheduleData.shifts || [])];
      
      selectedDates.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        
        // Remove existing shifts for this date
        const filteredShifts = newShifts.filter(s => s.date !== dateStr);
        
        // Add new shift for this date
        filteredShifts.push({
          id: uuidv4(),
          employeeId: selectedEmployee,
          date: dateStr,
          startTime: currentShift.startTime,
          endTime: currentShift.endTime,
          isRecurring: currentShift.isRecurring,
          recurringPattern: currentShift.recurringPattern,
          notes: currentShift.notes
        });
        
        // Update shifts array
        newSchedule = {
          ...scheduleData,
          shifts: filteredShifts
        };
      });
      
      // Reset selected dates
      setSelectedDates([]);
      
    } else {
      // Single date update
      const existingShifts = scheduleData.shifts || [];
      
      // Find if we're updating an existing shift or adding a new one
      const shiftIndex = existingShifts.findIndex(s => s.id === currentShift.id);
      
      let updatedShifts: WorkShift[];
      if (shiftIndex >= 0) {
        // Update existing shift
        updatedShifts = [...existingShifts];
        updatedShifts[shiftIndex] = { ...currentShift };
      } else {
        // Add new shift
        updatedShifts = [...existingShifts, { ...currentShift }];
      }
      
      newSchedule = {
        ...scheduleData,
        shifts: updatedShifts
      };
    }
    
    onSave(newSchedule);
    setIsDialogOpen(false);
    toast.success("Schedule updated");
  };
  
  // Delete shift
  const deleteShift = () => {
    if (!currentShift || !selectedEmployee || !scheduleData) return;
    
    const updatedShifts = (scheduleData.shifts || []).filter(
      shift => shift.id !== currentShift.id
    );
    
    const newSchedule = {
      ...scheduleData,
      shifts: updatedShifts
    };
    
    onSave(newSchedule);
    setIsDialogOpen(false);
    toast.success("Shift removed");
  };
  
  // Apply shifts to multiple days
  const applyToMultipleDates = () => {
    setIsSelectingMultiple(true);
    setIsDialogOpen(false);
    toast.info("Select multiple dates to apply this schedule");
  };
  
  // Apply bulk scheduling
  const applyBulkSchedule = () => {
    if (!currentShift || selectedDates.length === 0) {
      setIsSelectingMultiple(false);
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  // Navigate between months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Get classes for each day in the calendar
  const getDayClass = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const hasShifts = shiftsMap.has(dateStr);
    
    // Check if this date is in the multiple selection array
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    
    return {
      "bg-primary/5": hasShifts,
      "ring-2 ring-primary": isSelected && isSelectingMultiple,
      "cursor-pointer hover:bg-accent": true
    };
  };
  
  if (!selectedEmployee) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Please select an employee to manage their work schedule
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {isSelectingMultiple && (
        <div className="bg-accent/20 p-3 rounded-md flex justify-between items-center">
          <div>
            <h3 className="font-medium">Bulk Scheduling Mode</h3>
            <p className="text-sm text-muted-foreground">
              Select multiple days to apply the same schedule
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSelectingMultiple(false)}>
              Cancel
            </Button>
            <Button 
              onClick={applyBulkSchedule} 
              disabled={selectedDates.length === 0}
            >
              Apply to {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={goToPreviousMonth} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <h3 className="font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
        <Button variant="ghost" onClick={goToNextMonth} size="sm">
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-2">
        <Calendar
          mode="default"
          month={currentDate}
          onDayClick={handleDayClick}
          components={{
            Day: ({ day, ...props }: any) => (
              <div
                {...props}
                className={`h-20 w-full border rounded-md p-1 ${
                  Object.entries(getDayClass(day))
                    .filter(([, value]) => value)
                    .map(([className]) => className)
                    .join(" ")
                }`}
                onClick={() => handleDayClick(day)}
              >
                {renderDayContent(day)}
              </div>
            ),
          }}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onReset} disabled={loading}>
          Reset
        </Button>
        <Button onClick={() => onSave(scheduleData!)} disabled={loading || !scheduleData}>
          Save Schedule
        </Button>
      </div>
      
      {/* Shift Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSelectingMultiple 
                ? `Schedule for ${selectedDates.length} selected days` 
                : `Schedule for ${selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={currentShift?.startTime || ""}
                  onChange={(e) => 
                    setCurrentShift(prev => 
                      prev ? { ...prev, startTime: e.target.value } : null
                    )
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={currentShift?.endTime || ""}
                  onChange={(e) => 
                    setCurrentShift(prev => 
                      prev ? { ...prev, endTime: e.target.value } : null
                    )
                  }
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={currentShift?.notes || ""}
                onChange={(e) => 
                  setCurrentShift(prev => 
                    prev ? { ...prev, notes: e.target.value } : null
                  )
                }
                placeholder="Add any special instructions or notes"
              />
            </div>
            
            {!isSelectingMultiple && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={currentShift?.isRecurring || false}
                  onCheckedChange={(checked) => 
                    setCurrentShift(prev => 
                      prev ? { ...prev, isRecurring: checked } : null
                    )
                  }
                />
                <Label htmlFor="recurring">Recurring weekly</Label>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              {!isSelectingMultiple && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={applyToMultipleDates}
                >
                  Apply to Multiple Days
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {!isSelectingMultiple && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={deleteShift}
                >
                  Delete
                </Button>
              )}
              <Button type="button" onClick={saveShift}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
