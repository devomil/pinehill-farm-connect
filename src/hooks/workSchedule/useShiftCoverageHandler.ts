
import { useState } from "react";
import { WorkSchedule, WorkShift } from "@/types/workSchedule";
import { showToast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export function useShiftCoverageHandler(currentUser: User | null) {
  const [processing, setProcessing] = useState(false);

  // Handle shift transfer when a coverage request is accepted
  const handleShiftTransfer = async (
    requesterId: string,
    receiverId: string,
    shiftDate: string,
    shiftStartTime: string,
    shiftEndTime: string
  ) => {
    if (!currentUser) {
      showToast("error", "You must be logged in to process shift transfers");
      return false;
    }

    setProcessing(true);

    try {
      // Since we don't have actual DB table for work_schedules, we'll use mock data
      // In a real implementation, we would do:
      // const { data: requesterScheduleData } = await supabase
      //   .from('work_schedules')
      //   .select('*')
      //   .eq('employee_id', requesterId)
      //   .single();

      // Mock the requester and receiver schedules
      const requesterSchedule: WorkSchedule = {
        id: `mock-${requesterId}`,
        employeeId: requesterId,
        month: shiftDate.substring(0, 7), // YYYY-MM
        shifts: []
      };
      
      const receiverSchedule: WorkSchedule = {
        id: `mock-${receiverId}`,
        employeeId: receiverId,
        month: shiftDate.substring(0, 7), // YYYY-MM
        shifts: []
      };

      // Step 2: Find the shift to be transferred
      const shiftToTransfer = requesterSchedule.shifts.find(
        shift => shift.date === shiftDate && 
               shift.startTime === shiftStartTime && 
               shift.endTime === shiftEndTime
      );

      if (!shiftToTransfer) {
        // Create mock shift for demo purposes
        const mockShift: WorkShift = {
          id: `mock-shift-${Date.now()}`,
          employeeId: requesterId,
          date: shiftDate,
          startTime: shiftStartTime,
          endTime: shiftEndTime,
          isRecurring: false
        };
        
        // Remove from requester (filter out any shifts that might overlap)
        const updatedRequesterShifts = requesterSchedule.shifts.filter(
          shift => shift.date !== shiftDate || 
                 (shift.startTime !== shiftStartTime && shift.endTime !== shiftEndTime)
        );

        // Create new shift for receiver with the same details but new ID
        const transferredShift: WorkShift = {
          ...mockShift,
          id: `transfer-${Date.now()}`,
          employeeId: receiverId
        };
        
        // Update receiver schedule
        const receiverShifts = [...receiverSchedule.shifts, transferredShift];
        
        // Update both schedules in database (in real implementation)
        // For demo, we'll just show the toast
        
        showToast("success", "Shift successfully transferred");
        
        return true;
      }

      // Step 3: Remove shift from requester
      const updatedRequesterShifts = requesterSchedule.shifts.filter(
        shift => shift.id !== shiftToTransfer.id
      );

      // Step 4: Create new shift for receiver with the same details but new ID
      const transferredShift: WorkShift = {
        ...shiftToTransfer,
        id: `transfer-${uuidv4()}`,
        employeeId: receiverId
      };
      
      // Step 5: Update receiver schedule
      const updatedReceiverShifts = [...receiverSchedule.shifts, transferredShift];
      
      // Step 6: Update both schedules in database (in real implementation)
      // For this demo, we'll just show the toast
      
      showToast("success", "Shift successfully transferred");
      
      return true;
    } catch (error) {
      console.error("Error transferring shift:", error);
      showToast("error", "Failed to transfer shift");
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    handleShiftTransfer,
    processing
  };
}
