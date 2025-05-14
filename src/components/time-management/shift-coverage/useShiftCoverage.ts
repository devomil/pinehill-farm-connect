
import { useState, useCallback } from "react";
import { uuid } from "@/utils/uuid";
import { toast } from "sonner";

export const useShiftCoverage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{id: string, name: string} | null>(null);

  const openDialog = useCallback((employee: {id: string, name: string}) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleConfirmShifts = useCallback((selectedDays: string[], startTime: string, endTime: string) => {
    if (!selectedEmployee) return;
    
    // Here you would typically save the shifts to your database
    // For demo purposes we'll just show a toast
    toast.success(`Scheduled ${selectedDays.length} shift(s) for ${selectedEmployee.name}`);
    
    console.log({
      employeeId: selectedEmployee.id,
      shifts: selectedDays.map(day => ({
        id: uuid(),
        date: day,
        startTime,
        endTime,
      }))
    });
    
    closeDialog();
  }, [selectedEmployee, closeDialog]);

  return {
    isDialogOpen,
    selectedEmployee,
    openDialog,
    closeDialog,
    handleConfirmShifts
  };
};
