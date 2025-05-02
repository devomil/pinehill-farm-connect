
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

    // CRITICAL FIX: Improved direct database query to debug
    try {
      console.log("DEBUG: Before request - checking existing requests");
      const { data: existingRequests, error: checkError } = await supabase
        .from('shift_coverage_requests')
        .select('*')
        .limit(5);
      
      if (checkError) {
        console.error("Error checking existing requests:", checkError);
      } else {
        console.log(`Found ${existingRequests?.length || 0} existing shift coverage requests`);
      }
    } catch (e) {
      console.error("Error during debug check:", e);
    }
    
    // CRITICAL FIX: Create properly formatted shift coverage request that matches the schema
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
      // CRITICAL FIX: Use explicit Promise to wait for completion
      await new Promise<void>((resolve, reject) => {
        try {
          sendMessage({
            ...requestData,
            onSuccess: () => {
              console.log("sendMessage onSuccess callback fired");
              resolve();
            },
            onError: (error: any) => {
              console.error("sendMessage onError callback fired:", error);
              reject(error);
            }
          });
          
          // Set a timeout as a fallback
          setTimeout(() => {
            console.log("sendMessage timeout fallback triggered");
            resolve();
          }, 5000); // Increased timeout for reliability
        } catch (error) {
          console.error("Error in sendMessage:", error);
          reject(error);
        }
      });
      
      console.log("Shift coverage request sent successfully");
      
      // CRITICAL FIX: Improved verification with detailed error handling
      setTimeout(async () => {
        try {
          console.log("Verifying shift request was saved...");
          
          // Check for any recently created shift coverage requests by this user
          const { data: verifyRequest, error: verifyError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .eq('original_employee_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (verifyError) {
            console.error("Error verifying shift request was saved:", verifyError);
            console.error("Error details:", verifyError.details, verifyError.hint);
          } else if (verifyRequest && verifyRequest.length > 0) {
            // Find requests that match our date
            const matchingRequests = verifyRequest.filter(req => 
              req.shift_date === formData.shiftDate
            );
            
            if (matchingRequests.length > 0) {
              console.log("✅ Verified shift request was saved successfully:", matchingRequests[0]);
            } else {
              console.warn("⚠️ No matching shift requests found for today's date");
              console.log("Recent shift requests:", verifyRequest);
            }
          } else {
            console.warn("⚠️ Could not verify shift request was saved - no requests found");
            
            // CRITICAL FIX: Try a raw query to check permissions
            const { data: tableInfo, error: tableError } = await supabase
              .from('shift_coverage_requests')
              .select('count(*)')
              .limit(1);
                
            if (tableError) {
              console.error("Error accessing shift_coverage_requests table:", tableError);
              console.error("This may be a permissions issue");
            } else {
              console.log("Table is accessible but no matching records found");
            }
          }
        } catch (error) {
          console.error("Error during verification:", error);
        }
      }, 3000); // Increased delay for reliability
      
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
