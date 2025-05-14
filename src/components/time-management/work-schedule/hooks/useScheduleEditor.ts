
import { useState, useEffect, useMemo } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { buildShiftsMap, createNewShift } from "../scheduleHelpers";
import { uuid } from "@/utils/uuid";

export interface UseScheduleEditorProps {
  selectedEmployee: string | null;
  scheduleData: WorkSchedule | null;
  onSave: (schedule: WorkSchedule) => void;
}

export const useScheduleEditor = ({ 
  selectedEmployee, 
  scheduleData,
  onSave 
}: UseScheduleEditorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [bulkMode, setBulkMode] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">("single");
  
  // If employee changes or schedule data changes, reset editing state
  useEffect(() => {
    setSelectedDate(undefined);
    setEditingShift(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
    setBulkMode(null);
    setSelectionMode("single");
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
    setSelectionMode("single");
  };
  
  // Toggle selection mode for specific days
  const toggleSelectionMode = () => {
    if (selectionMode === "single") {
      setSelectionMode("multiple");
    } else {
      setSelectionMode("single");
    }
  };
  
  return {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    isDialogOpen,
    setIsDialogOpen,
    editingShift,
    isEditMode,
    bulkMode,
    setBulkMode,
    selectionMode,
    shiftsMap,
    handleAddShift,
    handleEditShift,
    handleSaveShift,
    handleDeleteShift,
    handleBulkSchedule,
    toggleSelectionMode
  };
};
