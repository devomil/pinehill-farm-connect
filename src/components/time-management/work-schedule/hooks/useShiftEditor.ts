
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { createNewShift } from "../scheduleHelpers";
import { toast } from "sonner";
import { format, isValid } from "date-fns";

export function useShiftEditor(
  selectedEmployee: string | null,
  scheduleData: WorkSchedule | null,
  onSave: (schedule: WorkSchedule) => void
) {
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Handle adding a new shift
  const handleAddShift = (selectedDate: Date | undefined) => {
    if (!selectedEmployee || !selectedDate || !isValid(selectedDate)) {
      toast.error("Please select a valid employee and date");
      return;
    }
    
    console.log("Creating new shift for date:", format(selectedDate, "yyyy-MM-dd"));
    const newShift = createNewShift(selectedEmployee, selectedDate);
    setEditingShift(newShift);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };
  
  // Handle editing an existing shift
  const handleEditShift = (shift: WorkShift) => {
    console.log("Editing shift for date:", shift.date);
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
    toast.success("Shift saved successfully");
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
    toast.success("Shift deleted successfully");
  };

  return {
    editingShift,
    isEditMode,
    isDialogOpen,
    setIsDialogOpen,
    handleAddShift,
    handleEditShift,
    handleSaveShift,
    handleDeleteShift
  };
}
