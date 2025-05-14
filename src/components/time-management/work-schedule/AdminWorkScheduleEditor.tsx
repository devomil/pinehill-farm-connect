
import React, { useState, useEffect, useMemo } from "react";
import { WorkScheduleEditorProps, WorkShift } from "@/types/workSchedule";
import { format } from "date-fns";
import { CardDescription } from "@/components/ui/card";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { createNewShift, buildShiftsMap } from "./scheduleHelpers";
import { uuid } from "@/utils/uuid";
import { Button } from "@/components/ui/button";

export const AdminWorkScheduleEditor: React.FC<WorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<string | null>(null);
  
  // If employee changes or schedule data changes, reset editing state
  useEffect(() => {
    setSelectedDate(undefined);
    setEditingShift(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
  }, [selectedEmployee, scheduleData?.id]);
  
  // Create map of dates to shifts
  const shiftsMap = useMemo(() => {
    return buildShiftsMap(scheduleData);
  }, [scheduleData]);
  
  // Handle adding a new shift
  const handleAddShift = () => {
    if (!selectedEmployee || !selectedDate) return;
    
    const newShift = createNewShift(selectedEmployee, selectedDate);
    setEditingShift(newShift);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };
  
  // Handle editing an existing shift
  const handleEditShift = (shift: WorkShift) => {
    setEditingShift(shift);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Handle saving a shift (new or edited)
  const handleSaveShift = (shift: WorkShift) => {
    if (!scheduleData || !selectedEmployee) return;
    
    let updatedShifts;
    
    if (isEditMode) {
      // Update existing shift
      updatedShifts = scheduleData.shifts.map(s => 
        s.id === shift.id ? shift : s
      );
    } else {
      // Add new shift
      updatedShifts = [...scheduleData.shifts, shift];
    }
    
    const updatedSchedule = {
      ...scheduleData,
      shifts: updatedShifts,
    };
    
    onSave(updatedSchedule);
    setIsDialogOpen(false);
  };
  
  // Handle deleting a shift
  const handleDeleteShift = (shiftId: string) => {
    if (!scheduleData) return;
    
    const updatedSchedule = {
      ...scheduleData,
      shifts: scheduleData.shifts.filter(s => s.id !== shiftId),
    };
    
    onSave(updatedSchedule);
    setIsDialogOpen(false);
  };
  
  // Handle bulk scheduling
  const handleBulkSchedule = (days: string[], startTime: string, endTime: string) => {
    if (!scheduleData || !selectedEmployee) return;
    
    const newShifts = days.map(day => {
      const [year, month, dayOfMonth] = day.split('-').map(Number);
      const shiftDate = new Date(year, month - 1, dayOfMonth);
      
      return {
        id: uuid(),
        employeeId: selectedEmployee,
        date: day,
        startTime,
        endTime,
        isRecurring: false,
      };
    });
    
    // Remove any existing shifts on these days
    const existingShiftsFiltered = scheduleData.shifts.filter(
      shift => !days.includes(shift.date)
    );
    
    const updatedSchedule = {
      ...scheduleData,
      shifts: [...existingShiftsFiltered, ...newShifts],
    };
    
    onSave(updatedSchedule);
    setBulkMode(null);
  };
  
  if (!selectedEmployee) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Please select an employee to manage their schedule
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <CardDescription>
        Schedule for {format(currentMonth, 'MMMM yyyy')}
      </CardDescription>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkMode("weekdays")}
          disabled={loading}
        >
          Add Weekday Shifts
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkMode("weekend")}
          disabled={loading}
        >
          Add Weekend Shifts
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={onReset}
          disabled={loading}
        >
          Reset Schedule
        </Button>
      </div>
      
      {bulkMode && (
        <BulkSchedulingBar
          bulkMode={bulkMode}
          currentMonth={currentMonth}
          onSchedule={handleBulkSchedule}
          onCancel={() => setBulkMode(null)}
        />
      )}
      
      <WorkScheduleCalendar
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        shiftsMap={shiftsMap}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onDateSelected={handleAddShift}
        onShiftClick={handleEditShift}
      />
      
      {isDialogOpen && editingShift && (
        <ShiftDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          shift={editingShift}
          isEditMode={isEditMode}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
        />
      )}
    </div>
  );
};
