
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { uuid } from "@/utils/uuid";
import { useSendMessage } from "@/hooks/communications/useSendMessage";
import { useAuth } from "@/contexts/AuthContext";

export const useShiftCoverage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{id: string, name: string} | null>(null);
  const { currentUser } = useAuth();
  const sendMessageMutation = useSendMessage(currentUser);

  const openDialog = useCallback((employee: {id: string, name: string}) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleConfirmShifts = useCallback(async (selectedDays: string[], startTime: string, endTime: string) => {
    if (!selectedEmployee || !currentUser) {
      toast.error("Missing employee or user information");
      return;
    }
    
    try {
      // For each selected day, send a shift coverage request
      for (const day of selectedDays) {
        await sendMessageMutation.mutateAsync({
          recipientId: selectedEmployee.id,
          message: `I need coverage for my shift on ${day} from ${startTime} to ${endTime}.`,
          type: 'shift_coverage',
          shiftDetails: {
            original_employee_id: currentUser.id,
            covering_employee_id: selectedEmployee.id,
            shift_date: day,
            shift_start: startTime,
            shift_end: endTime
          }
        });
      }
      
      toast.success(`Sent ${selectedDays.length} shift coverage request(s) to ${selectedEmployee.name}`);
    } catch (error) {
      console.error("Error sending shift requests:", error);
      toast.error("Failed to send shift coverage requests");
    }
    
    closeDialog();
  }, [selectedEmployee, currentUser, sendMessageMutation, closeDialog]);

  return {
    isDialogOpen,
    selectedEmployee,
    openDialog,
    closeDialog,
    handleConfirmShifts
  };
};
