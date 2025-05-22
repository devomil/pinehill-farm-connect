
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { createNewShift } from "../scheduleHelpers";
import { toast } from "sonner";

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
    toast("Shift saved successfully");
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
