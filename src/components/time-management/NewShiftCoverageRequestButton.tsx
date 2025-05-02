
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@/types";
import { NewMessageFormData } from "@/types/communications";
import { toast } from "sonner";
import { NewShiftCoverageRequestForm } from "./shift-coverage/NewShiftCoverageRequestForm";
import { useCommunications } from "@/hooks/useCommunications";
import { supabase } from "@/integrations/supabase/client";

interface NewShiftCoverageRequestButtonProps {
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
}

export const NewShiftCoverageRequestButton: React.FC<NewShiftCoverageRequestButtonProps> = ({
  currentUser,
  allEmployees,
  onRequestSent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useCommunications(false); // Important: set to false to include shift coverage

  // Check if there are available employees
  const hasAvailableEmployees = allEmployees && allEmployees
    .filter(emp => emp.id !== currentUser.id)
    .length > 0;

  const handleNewRequest = async (formData: NewMessageFormData) => {
    setIsLoading(true);
    
    console.log("Submitting shift coverage request:", formData);
    
    if (!formData.shiftDate || !formData.shiftStart || !formData.shiftEnd) {
      toast.error("Missing required shift details");
      setIsLoading(false);
      return;
    }
    
    // Create properly formatted shift coverage request
    const requestData = {
      recipientId: formData.recipientId,
      message: formData.message,
      type: "shift_coverage" as const,
      shiftDetails: {
        shift_date: formData.shiftDate,
        shift_start: formData.shiftStart, 
        shift_end: formData.shiftEnd,
        original_employee_id: currentUser.id,
        covering_employee_id: formData.recipientId
      }
    };
    
    console.log("Sending shift coverage request with data:", JSON.stringify(requestData, null, 2));
    
    try {
      // Use the sendMessage function from useCommunications hook
      await new Promise<void>((resolve, reject) => {
        try {
          sendMessage({
            ...requestData,
            onSuccess: () => resolve(),
            onError: (error: any) => reject(error)
          });
          
          // Since sendMessage uses mutation.mutate which doesn't return a promise,
          // we'll set a timeout as a fallback to resolve the promise
          setTimeout(() => resolve(), 2000);
        } catch (error) {
          reject(error);
        }
      });
      
      console.log("Shift coverage request sent successfully");
      
      // Log additional debug information directly to the console
      const { data: latestRequests, error: checkError } = await supabase
        .from('shift_coverage_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (checkError) {
        console.error("Error checking recent shift coverage requests:", checkError);
      } else {
        console.log("Recent shift coverage requests:", latestRequests);
      }
      
      // Verify if our request was saved
      setTimeout(async () => {
        const { data: verifyRequest, error: verifyError } = await supabase
          .from('shift_coverage_requests')
          .select('*')
          .eq('original_employee_id', currentUser.id)
          .eq('shift_date', formData.shiftDate)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (verifyError) {
          console.error("Error verifying shift request was saved:", verifyError);
        } else if (verifyRequest && verifyRequest.length > 0) {
          console.log("Verified shift request was saved successfully:", verifyRequest[0]);
        } else {
          console.warn("Could not verify shift request was saved");
        }
      }, 2000);
      
      setIsLoading(false);
      setIsOpen(false);
      onRequestSent(); // Refresh the list after sending
      toast.success("Shift coverage request sent successfully");
    } catch (error) {
      console.error("Error sending shift coverage request:", error);
      toast.error("Failed to send shift coverage request");
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          disabled={!hasAvailableEmployees}
          title={!hasAvailableEmployees ? "No employees available for shift coverage" : "New shift coverage request"}
        >
          <CalendarPlus className="mr-1 h-4 w-4" />
          {hasAvailableEmployees ? "Request Coverage" : "No Employees Available"}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request Shift Coverage</SheetTitle>
          <SheetDescription>
            Send a request to another employee to cover your shift.
          </SheetDescription>
        </SheetHeader>
        <NewShiftCoverageRequestForm
          employees={allEmployees}
          onSubmit={handleNewRequest}
          isLoading={isLoading}
          currentUser={currentUser}
        />
      </SheetContent>
    </Sheet>
  );
};
