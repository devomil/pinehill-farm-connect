
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { TimeOffRequest } from "@/types/timeManagement";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useTimeOffScheduleUpdater } from "./useTimeOffScheduleUpdater";

export function useTimeOffApprovalHandler(currentUser: User | null) {
  const [processing, setProcessing] = useState(false);
  const { handleTimeOffApproval } = useTimeOffScheduleUpdater(currentUser);
  
  const approveTimeOff = async (timeOffRequest: TimeOffRequest) => {
    if (!currentUser) {
      toast({
        description: "You must be logged in to approve time-off requests",
        variant: "destructive"
      });
      return false;
    }
    
    setProcessing(true);
    
    try {
      // Update the time-off request status in the database
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'approved',
          admin_id: currentUser.id
        })
        .eq('id', timeOffRequest.id);
      
      if (error) throw error;
      
      // Update the local time-off request object
      const updatedRequest: TimeOffRequest = {
        ...timeOffRequest,
        status: 'approved',
        admin_id: currentUser.id
      };
      
      // Update employee's schedule based on the time-off
      await handleTimeOffApproval(updatedRequest, true);
      
      toast({
        description: "Time-off approved and schedule updated",
        variant: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error approving time-off request:", error);
      toast({
        description: "Failed to approve time-off request",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };
  
  const rejectTimeOff = async (timeOffRequest: TimeOffRequest) => {
    if (!currentUser) {
      toast({
        description: "You must be logged in to reject time-off requests",
        variant: "destructive"
      });
      return false;
    }
    
    setProcessing(true);
    
    try {
      // Update the time-off request status in the database
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'rejected',
          admin_id: currentUser.id
        })
        .eq('id', timeOffRequest.id);
      
      if (error) throw error;
      
      toast({
        description: "Time-off request rejected",
        variant: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error rejecting time-off request:", error);
      toast({
        description: "Failed to reject time-off request",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };
  
  return {
    approveTimeOff,
    rejectTimeOff,
    processing
  };
}
