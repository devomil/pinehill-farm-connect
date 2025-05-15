
import React, { useState } from "react";
import { WorkScheduleEditorProps } from "@/types/workSchedule";
import { format } from "date-fns";
import { CardDescription } from "@/components/ui/card";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { SpecificDaysSchedulingBar } from "./SpecificDaysSchedulingBar";
import { ScheduleActionBar } from "./ScheduleActionBar";
import { useScheduleEditor } from "./hooks/useScheduleEditor";
import { useAdminScheduleTools } from "@/hooks/workSchedule";
import { AdminSchedulingToolsBar } from "./AdminSchedulingToolsBar";
import { Button } from "@/components/ui/button";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

export const AdminWorkScheduleEditor: React.FC<WorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading
}) => {
  const [showAdminTools, setShowAdminTools] = useState(false);
  const { unfilteredEmployees } = useEmployeeDirectory();
  
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
    selectedCount,
    shiftsMap,
    handleAddShift,
    handleEditShift,
    handleSaveShift,
    handleDeleteShift,
    handleBulkSchedule,
    toggleSelectionMode,
    toggleDay,
    isDaySelected,
    getSelectedDayStrings
  } = useScheduleEditor({ selectedEmployee, scheduleData, onSave });
  
  // Use admin scheduling tools
  const { 
    assignWeekdayShifts, 
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage
  } = useAdminScheduleTools(scheduleData, onSave);
  
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
      
      <div className="flex justify-between">
        <ScheduleActionBar
          bulkMode={bulkMode}
          selectionMode={selectionMode}
          loading={loading}
          selectedCount={selectedCount}
          onToggleSelectionMode={toggleSelectionMode}
          onSetBulkMode={setBulkMode}
          onReset={onReset}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdminTools(!showAdminTools)}
        >
          {showAdminTools ? "Hide Admin Tools" : "Show Admin Tools"}
        </Button>
      </div>
      
      {showAdminTools && (
        <AdminSchedulingToolsBar
          selectedEmployee={selectedEmployee}
          currentMonth={currentMonth}
          onAssignWeekday={assignWeekdayShifts}
          onAssignWeekend={assignWeekendShifts}
          onCheckConflicts={(shifts) => checkTimeOffConflicts(selectedEmployee, shifts)}
          onAutoAssignCoverage={autoAssignCoverage}
          availableEmployees={unfilteredEmployees}
          scheduleData={scheduleData}
        />
      )}
      
      {bulkMode && (
        <BulkSchedulingBar
          bulkMode={bulkMode}
          currentMonth={currentMonth}
          onSchedule={handleBulkSchedule}
          onCancel={() => setBulkMode(null)}
        />
      )}
      
      {selectionMode === "multiple" && selectedCount > 0 && (
        <SpecificDaysSchedulingBar
          selectedDays={getSelectedDayStrings()}
          currentMonth={currentMonth}
          onSchedule={handleBulkSchedule}
          onCancel={() => {
            toggleSelectionMode();
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
