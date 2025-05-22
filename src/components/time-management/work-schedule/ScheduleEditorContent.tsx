import React from "react";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { ShiftDialog } from "./ShiftDialog";
import { BulkSchedulingBar } from "./BulkSchedulingBar";
import { SpecificDaysSchedulingBar } from "./SpecificDaysSchedulingBar";
import { ScheduleActionBar } from "./ScheduleActionBar";
import { AdminSchedulingTools } from "./AdminSchedulingTools";
import { ScheduleEditorState } from "./hooks/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, User, Calendar, Clock, FileText } from "lucide-react";
import { DateRangeSelector } from "./DateRangeSelector";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

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
  // Get shifts for the selected date
  const selectedDateString = editorState.selectedDate ? format(editorState.selectedDate, "yyyy-MM-dd") : "";
  const selectedDateShifts = selectedDateString ? (editorState.shiftsMap.get(selectedDateString) || []) : [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <ScheduleActionBar
          bulkMode={editorState.bulkMode}
          selectionMode={editorState.selectionMode}
          loading={loading}
          selectedCount={editorState.selectedCount}
          onToggleSelectionMode={editorState.toggleSelectionMode}
          onToggleRangeMode={editorState.toggleRangeMode}
          onSetBulkMode={editorState.setBulkMode}
          onReset={onReset}
          showAdminTools={editorState.showAdminTools}
          onToggleAdminTools={() => editorState.setShowAdminTools(!editorState.showAdminTools)}
        />
      </div>
      
      {editorState.selectionMode === "multiple" && (
        <Alert variant="default" className="mb-4 bg-orange-50 border-orange-300">
          <Info className="h-4 w-4 text-orange-500" />
          <AlertTitle className="text-orange-800">Multi-Select Mode Active</AlertTitle>
          <AlertDescription className="text-orange-700">
            Click on calendar days below to select them for scheduling. You can select multiple days.
          </AlertDescription>
        </Alert>
      )}

      {editorState.selectionMode === "range" && (
        <DateRangeSelector 
          onDaysSelected={(days) => {
            editorState.clearSelectedDays();
            // Add all days in range to selection
            for (const day of days) {
              const [year, month, dayNum] = day.split('-').map(Number);
              const date = new Date(year, month - 1, dayNum);
              editorState.toggleDay(date);
            }
            
            // Show the specific days scheduling bar now
            editorState.toggleRangeMode(); // Exit range mode
            editorState.toggleSelectionMode(); // Enter multiple selection mode
          }}
          onCancel={editorState.toggleRangeMode}
        />
      )}

      {editorState.showAdminTools && (
        <AdminSchedulingTools
          selectedEmployee={editorState.selectedEmployee}
          currentMonth={editorState.currentMonth}
          scheduleData={editorState.scheduleData}
          onAddSpecificDayShift={editorState.handleAddSpecificDayShift}
        />
      )}
      
      {editorState.bulkMode && (
        <BulkSchedulingBar
          bulkMode={editorState.bulkMode}
          currentMonth={editorState.currentMonth}
          onSchedule={editorState.handleBulkSchedule}
          onCancel={() => editorState.setBulkMode(null)}
        />
      )}
      
      {editorState.selectionMode === "multiple" && editorState.selectedCount > 0 && (
        <SpecificDaysSchedulingBar
          selectedDays={editorState.getSelectedDayStrings()}
          currentMonth={editorState.currentMonth}
          onSchedule={editorState.handleBulkSchedule}
          onCancel={editorState.toggleSelectionMode}
          onClearSelection={editorState.clearSelectedDays}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkScheduleCalendar
            currentMonth={editorState.currentMonth}
            setCurrentMonth={editorState.setCurrentMonth}
            shiftsMap={editorState.shiftsMap}
            selectedDate={editorState.selectedDate}
            setSelectedDate={editorState.setSelectedDate}
            onDateSelected={editorState.handleAddShift}
            onShiftClick={editorState.handleEditShift}
            selectionMode={editorState.selectionMode}
            isDaySelected={editorState.isDaySelected}
            onDayToggle={editorState.toggleDay}
            selectedCount={editorState.selectedCount}
            hideCalendar={editorState.selectionMode === "range"}
            onDeleteShift={editorState.handleDeleteShift}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Shift Details</h3>
            {selectedDateString ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span>{editorState.selectedDate && format(editorState.selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Employee: {editorState.selectedEmployee || "None selected"}</span>
                </div>
                
                {selectedDateShifts.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Scheduled Shifts</h4>
                    {selectedDateShifts.map((shift, index) => (
                      <div 
                        key={shift.id} 
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => editorState.handleEditShift(shift)}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                          </span>
                        </div>
                        
                        {shift.notes && (
                          <div className="mt-2 flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-sm text-gray-600">{shift.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No shifts scheduled for this day
                  </div>
                )}
                
                <button
                  onClick={() => editorState.handleAddShift(editorState.selectedDate)}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                >
                  Add Shift for {format(editorState.selectedDate, "MMM d")}
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Select a date to view or add shifts
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {editorState.isDialogOpen && editorState.editingShift && (
        <ShiftDialog
          isOpen={editorState.isDialogOpen}
          onClose={() => editorState.setIsDialogOpen(false)}
          shift={editorState.editingShift}
          isEditMode={editorState.isEditMode}
          onSave={editorState.handleSaveShift}
          onDelete={editorState.handleDeleteShift}
        />
      )}
    </div>
  );
};
