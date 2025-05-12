
import { useCallback } from "react";
import { toast } from "sonner";

export function useMessageValidation() {
  const validateShiftCoverageMessage = useCallback((params: any) => {
    // Enhanced validation for shift coverage requests
    if (params.type !== 'shift_coverage') return true;
    
    // Validate shift details
    if (!params.shiftDetails) {
      console.error("Missing shiftDetails object for shift coverage request");
      toast.error("Missing shift details");
      return false;
    }
    
    const { shiftDetails } = params;
    
    if (!shiftDetails.shift_date) {
      console.error("Missing shift date");
      toast.error("Please select a date for the shift");
      return false;
    }
    
    if (!shiftDetails.shift_start) {
      console.error("Missing shift start time");
      toast.error("Please enter a start time for the shift");
      return false;
    }
    
    if (!shiftDetails.shift_end) {
      console.error("Missing shift end time");
      toast.error("Please enter an end time for the shift");
      return false;
    }
    
    // Validate recipient
    if (!params.recipientId) {
      console.error("Missing recipient ID for shift coverage request");
      toast.error("Please select an employee to cover your shift");
      return false;
    }
    
    return true;
  }, []);

  return { validateShiftCoverageMessage };
}
