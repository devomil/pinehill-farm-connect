
import React, { useState } from "react";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { SpecificDaysSchedulingBar } from "./SpecificDaysSchedulingBar";
import { ScheduleActionBar } from "./ScheduleActionBar";
import { AdminSchedulingTools } from "./AdminSchedulingTools";
import { Button } from "@/components/ui/button";
import { ScheduleEditorState } from "./hooks/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DateRangeSelector } from "./DateRangeSelector";

interface ScheduleEditorContentProps {
  editorState: ReturnType<typeof import("./hooks/useScheduleEditor").useScheduleEditor>;
  loading?: boolean;
  onReset: () => void;
}

export const ScheduleEditorContent: React.FC<ScheduleEditorContentProps> = ({
  editorState,
  loading,
  onReset
}) => {
  const [showAdminTools, setShowAdminTools] = useState(false);
  
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
    toggleRangeMode,
    toggleDay,
    isDaySelected,
    clearSelectedDays,
    getSelectedDayStrings
  } = editorState;
  
  return (
    <>
      <div className="flex justify-between">
        <ScheduleActionBar
          bulkMode={bulkMode}
          selectionMode={selectionMode}
          loading={loading}
          selectedCount={selectedCount}
          onToggleSelectionMode={toggleSelectionMode}
          onToggleRangeMode={toggleRangeMode}
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
      
      {selectionMode === "multiple" && (
        <Alert variant="default" className="mb-4 bg-orange-50 border-orange-300">
          <Info className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-800">Multi-Select Mode Active</AlertTitle>
          <AlertDescription className="text-orange-700">
            Click on calendar days below to select them for scheduling. You can select multiple days.
          </AlertDescription>
        </Alert>
      )}

      {selectionMode === "range" && (
        <DateRangeSelector 
          onDaysSelected={(days) => {
            clearSelectedDays();
            // Add all days in range to selection
            for (const day of days) {
              const [year, month, dayNum] = day.split('-').map(Number);
              const date = new Date(year, month - 1, dayNum);
              toggleDay(date);
            }
            
            // Show the specific days scheduling bar now
            toggleRangeMode(); // Exit range mode
            toggleSelectionMode(); // Enter multiple selection mode
          }}
          onCancel={toggleRangeMode}
        />
      )}

      {showAdminTools && (
        <AdminSchedulingTools
          selectedEmployee={editorState.selectedEmployee}
          currentMonth={currentMonth}
          scheduleData={editorState.scheduleData}
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
          onCancel={toggleSelectionMode}
          onClearSelection={clearSelectedDays}
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
        selectedCount={selectedCount}
        hideCalendar={selectionMode === "range"}
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
    </>
  );
};
