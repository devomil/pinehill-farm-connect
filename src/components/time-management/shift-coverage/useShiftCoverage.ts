
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useCommunications } from "@/hooks/useCommunications";
import { format } from "date-fns";
import { toast } from "sonner";

export function useShiftCoverage(
  currentUser: User,
  allEmployees: User[] | undefined,
  onRequestSent: () => void,
  onDialogClose: (open: boolean) => void
) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { sendMessage } = useCommunications();
  
  // Filter out the current user and any employees that might be inactive
  const filteredEmployees = allEmployees 
    ? allEmployees.filter(employee => employee.id !== currentUser.id)
    : [];

  // Fetch Jackie's actual UUID when component mounts
  useEffect(() => {
    const fetchJackieAdmin = async () => {
      setIsLoadingAdmin(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'jackie@pinehillfarm.co')
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching Jackie's profile:", error);
          return;
        }
        
        if (data && data.id) {
          console.log("Found admin (Jackie) with ID:", data.id);
          setAdminId(data.id);
        } else {
          console.warn("Could not find Jackie's profile, admin CC will not be set");
        }
      } catch (err) {
        console.error("Exception fetching admin:", err);
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    
    fetchJackieAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation with custom error messages
    if (!selectedEmployeeId) {
      toast.error("Please select an employee to cover your shift");
      return;
    }
    
    if (!date) {
      toast.error("Please select a date for your shift");
      return;
    }
    
    if (!startTime) {
      toast.error("Please specify shift start time");
      return;
    }
    
    if (!endTime) {
      toast.error("Please specify shift end time");
      return;
    }
    
    if (!currentUser || !currentUser.id) {
      toast.error("User profile error. Please try logging out and back in.");
      return;
    }
    
    setIsSending(true);
    
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      console.log("Sending shift coverage request with data:", {
        recipientId: selectedEmployeeId,
        date: formattedDate,
        startTime,
        endTime,
        message: message || "Could you please cover my shift?",
        currentUserId: currentUser?.id,
        adminId: adminId
      });
      
      await sendMessage({
        recipientId: selectedEmployeeId,
        message: message || "Could you please cover my shift?",
        type: "shift_coverage",
        shiftDetails: {
          shift_date: formattedDate,
          shift_start: startTime,
          shift_end: endTime,
          original_employee_id: currentUser.id,
          covering_employee_id: selectedEmployeeId
        },
        adminCc: adminId
      });
      
      toast.success("Shift coverage request sent successfully");
      onDialogClose(false);
      
      // Reset form
      setSelectedEmployeeId("");
      setMessage("");
      setDate(new Date());
      setStartTime("09:00");
      setEndTime("17:00");
      
      // Notify parent that a request was sent to refresh data
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error("Error sending shift coverage request:", error);
      toast.error(`Failed to send shift coverage request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  return {
    selectedEmployeeId,
    setSelectedEmployeeId,
    message,
    setMessage,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    adminId,
    isLoadingAdmin,
    isSending,
    filteredEmployees,
    handleSubmit
  };
}
