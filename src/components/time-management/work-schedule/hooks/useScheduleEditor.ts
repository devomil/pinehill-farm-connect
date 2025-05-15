
import { useState, useEffect } from "react";
import { useDaySelector } from "@/contexts/timeManagement/hooks";
import { UseScheduleEditorProps, ScheduleEditorState } from "./types";
import { useShiftEditor } from "./useShiftEditor";
import { useBulkScheduler } from "./useBulkScheduler";
import { useCalendarDates } from "./useCalendarDates";

export const useScheduleEditor = ({ 
  selectedEmployee, 
  scheduleData,
  onSave 
}: UseScheduleEditorProps) => {
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">("single");
  
  // Use the component hooks
  const {
    selectedDate,
    setSelectedDate,
    currentMonth, 
    setCurrentMonth,
    shiftsMap
  } = useCalendarDates(scheduleData);
  
  const {
    editingShift,
    isEditMode,
    isDialogOpen,
    setIsDialogOpen,
    handleAddShift,
    handleEditShift,
    handleSaveShift,
    handleDeleteShift
  } = useShiftEditor(selectedEmployee, scheduleData, onSave);
  
  const {
    bulkMode,
    setBulkMode,
    handleBulkSchedule
  } = useBulkScheduler(selectedEmployee, scheduleData, onSave);
  
  // Use the day selector hook for multiple day selection
  const { 
    toggleDay, 
    isDaySelected, 
    clearSelectedDays, 
    getSelectedDaysArray,
    getSelectedDayStrings,
    selectedCount
  } = useDaySelector();
  
  // If employee changes or schedule data changes, reset editing state
  useEffect(() => {
    setSelectedDate(undefined);
    setIsDialogOpen(false);
    setBulkMode(null);
    setSelectionMode("single");
    clearSelectedDays();
  }, [selectedEmployee, scheduleData?.id, clearSelectedDays]);
  
  // Toggle selection mode for specific days
  const toggleSelectionMode = () => {
    if (selectionMode === "single") {
      setSelectionMode("multiple");
    } else {
      setSelectionMode("single");
      clearSelectedDays();
    }
  };

  // Wrapper to handle add shift with current selected date
  const handleAddShiftFromCalendar = () => {
    handleAddShift(selectedDate);
  };

  return {
    selectedEmployee, // Added to expose in the hook return value
    scheduleData, // Added to expose in the hook return value
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
    selectedCount,
    shiftsMap,
    handleAddShift: handleAddShiftFromCalendar,
    handleEditShift,
    handleSaveShift,
    handleDeleteShift,
    handleBulkSchedule,
    toggleSelectionMode,
    toggleDay,
    isDaySelected,
    clearSelectedDays,
    getSelectedDaysArray,
    getSelectedDayStrings
  };
};
