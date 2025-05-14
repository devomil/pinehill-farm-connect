
import React from "react";
import { WorkScheduleEditorProps } from "@/types/workSchedule";
import { format } from "date-fns";
import { CardDescription } from "@/components/ui/card";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { SpecificDaysSchedulingBar } from "./SpecificDaysSchedulingBar";
import { useDaySelector } from "@/contexts/timeManagement/hooks/useDaySelector";
import { ScheduleActionBar } from "./ScheduleActionBar";
import { useScheduleEditor } from "./hooks/useScheduleEditor";

export const AdminWorkScheduleEditor: React.FC<WorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading
}) => {
  // Use the day selector hook
  const { 
    toggleDay, 
    isDaySelected, 
    clearSelectedDays, 
    getSelectedDaysArray,
    availableDays
  } = useDaySelector(useScheduleEditor({ selectedEmployee, scheduleData, onSave }).currentMonth);
  
  // Use the schedule editor hook
  const {
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
  } = useScheduleEditor({ selectedEmployee, scheduleData, onSave });
  
  // Debug available days
  React.useEffect(() => {
    console.log("Available days in month:", availableDays.length);
  }, [availableDays]);
  
  // When selection mode changes, clear selected days
  React.useEffect(() => {
    if (selectionMode === "single") {
      clearSelectedDays();
    }
  }, [selectionMode, clearSelectedDays]);
  
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
      
      <ScheduleActionBar
        bulkMode={bulkMode}
        selectionMode={selectionMode}
        loading={loading}
        onToggleSelectionMode={toggleSelectionMode}
        onSetBulkMode={setBulkMode}
        onReset={onReset}
      />
      
      {bulkMode && (
        <BulkSchedulingBar
          bulkMode={bulkMode}
          currentMonth={currentMonth}
          onSchedule={handleBulkSchedule}
          onCancel={() => setBulkMode(null)}
        />
      )}
      
      {selectionMode === "multiple" && getSelectedDaysArray().length > 0 && (
        <SpecificDaysSchedulingBar
          selectedDays={getSelectedDaysArray()}
          currentMonth={currentMonth}
          onSchedule={handleBulkSchedule}
          onCancel={() => {
            toggleSelectionMode();
            clearSelectedDays();
          }}
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
        selectionMode={selectionMode}
        isDaySelected={isDaySelected}
        onDayToggle={toggleDay}
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
