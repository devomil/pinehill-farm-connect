
import { useState, useEffect } from "react";
import { useDaySelector } from "@/contexts/timeManagement/hooks";
import { UseScheduleEditorProps, ScheduleEditorState } from "./types";
import { useShiftEditor } from "./useShiftEditor";
import { useBulkScheduler } from "./useBulkScheduler";
import { useCalendarDates } from "./useCalendarDates";
import { format } from "date-fns";

export const useScheduleEditor = ({ 
  selectedEmployee, 
  scheduleData,
  onSave 
}: UseScheduleEditorProps) => {
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple" | "range">("single");
  
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
  }, [selectedEmployee, scheduleData?.id, clearSelectedDays, setSelectedDate, setIsDialogOpen, setBulkMode]);
  
  // Toggle selection mode for specific days
  const toggleSelectionMode = () => {
    if (selectionMode === "single") {
      console.log("Switching to multiple selection mode");
      setSelectionMode("multiple");
      // Clear any single date selection when switching to multiple mode
      setSelectedDate(undefined);
    } else if (selectionMode === "multiple") {
      console.log("Switching to single selection mode");
      setSelectionMode("single");
      clearSelectedDays();
    } else {
      // If in range mode, switch to single mode
      console.log("Switching to single selection mode from range mode");
      setSelectionMode("single");
    }
  };

  // Toggle range selection mode
  const toggleRangeMode = () => {
    if (selectionMode === "range") {
      console.log("Exiting range selection mode");
      setSelectionMode("single");
    } else {
      console.log("Entering range selection mode");
      setSelectionMode("range");
      // Clear any selections when switching to range mode
      setSelectedDate(undefined);
      clearSelectedDays();
      // Also clear bulk mode if active
      if (bulkMode) {
        setBulkMode(null);
      }
    }
  };

  // Wrapper to handle add shift with current selected date
  const handleAddShiftFromCalendar = (date?: Date) => {
    console.log(`Adding shift for date: ${date ? format(date, 'yyyy-MM-dd') : 'undefined'}`);
    handleAddShift(date || selectedDate);
  };

  return {
    selectedEmployee, 
    scheduleData,
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
    toggleRangeMode,
    toggleDay,
    isDaySelected,
    clearSelectedDays,
    getSelectedDaysArray,
    getSelectedDayStrings
  };
};
