
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { WorkSchedule, WorkShift, WorkScheduleEditorProps } from "@/types/workSchedule";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { buildShiftsMap, getDaysInMonth, createNewShift } from "./scheduleHelpers";

export const AdminWorkScheduleEditor: React.FC<WorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading = false // Provide a default value of false
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentShift, setCurrentShift] = useState<WorkShift | null>(null);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Get all days in the current month
  const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Get shifts for each day
  const shiftsMap = useMemo(() => buildShiftsMap(scheduleData), [scheduleData]);

  // Handle day click
  const handleDayClick = (day: Date) => {
    if (isSelectingMultiple) {
      // Toggle selection of multiple dates
      const isAlreadySelected = selectedDates.some(d => 
        d.getDate() === day.getDate() && 
        d.getMonth() === day.getMonth() && 
        d.getFullYear() === day.getFullYear()
      );
      
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
        setCurrentShift({
          ...existingShifts[0]
        });
      } else {
        // Create a new shift
        setCurrentShift(createNewShift(selectedEmployee || "", day));
      }
      
      setIsDialogOpen(true);
    }
  };

  // Update shift field
  const updateShiftField = (field: string, value: any) => {
    setCurrentShift(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Save shift from dialog
  const saveShift = () => {
    if (!currentShift || !selectedEmployee || !scheduleData) return;
    
    // Validate times
    if (currentShift.startTime >= currentShift.endTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    let newSchedule: WorkSchedule = { ...scheduleData };
    
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
      let updatedShifts;
      
      if (shiftIndex >= 0) {
        // Update existing shift
        updatedShifts = [...existingShifts];
        updatedShifts[shiftIndex] = {
          ...currentShift
        };
      } else {
        // Add new shift
        updatedShifts = [
          ...existingShifts,
          {
            ...currentShift
          }
        ];
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

  // Cancel bulk scheduling
  const cancelBulkScheduling = () => {
    setIsSelectingMultiple(false);
    setSelectedDates([]);
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

  if (!selectedEmployee) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Please select an employee to manage their work schedule
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BulkSchedulingBar
        isSelectingMultiple={isSelectingMultiple}
        selectedDatesCount={selectedDates.length}
        onCancel={cancelBulkScheduling}
        onApply={applyBulkSchedule}
      />
      
      <WorkScheduleCalendar
        currentDate={currentDate}
        shiftsMap={shiftsMap}
        isSelectingMultiple={isSelectingMultiple}
        selectedDates={selectedDates}
        onDayClick={handleDayClick}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          onClick={() => onSave(scheduleData as WorkSchedule)}
          disabled={loading || !scheduleData}
        >
          Save Schedule
        </Button>
      </div>
      
      <ShiftDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentShift={currentShift}
        selectedDate={selectedDate}
        isSelectingMultiple={isSelectingMultiple}
        selectedDatesCount={selectedDates.length}
        onSave={saveShift}
        onDelete={deleteShift}
        onApplyToMultiple={applyToMultipleDates}
        onShiftChange={updateShiftField}
      />
    </div>
  );
};
