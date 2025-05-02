
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

    // Verify the recipient exists
    const recipientExists = allEmployees.some(emp => emp.id === formData.recipientId);
    if (!recipientExists) {
      toast.error("Selected recipient no longer exists");
      setIsLoading(false);
      return;
    }

    // CRITICAL FIX: Debug check before attempting to create
    try {
      console.log("DEBUG: Before request - checking table access");
      const { data: testAccess, error: accessError } = await supabase
        .from('shift_coverage_requests')
        .select('count(*)')
        .limit(1);
      
      if (accessError) {
        console.error("Error accessing shift_coverage_requests table:", accessError);
      } else {
        console.log(`Table access check succeeded. Found ${testAccess?.length || 0} rows`);
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
      // Send the message
      await sendMessage(requestData);
      console.log("Message sent successfully");
      
      // Add a delay to let the database operations complete
      setTimeout(async () => {
        try {
          // Verify the request was created in the database
          const { data: verifyData, error: verifyError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .eq('original_employee_id', currentUser.id)
            .eq('covering_employee_id', formData.recipientId)
            .eq('shift_date', formData.shiftDate)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (verifyError) {
            console.error("Error verifying request creation:", verifyError);
          } else if (verifyData && verifyData.length > 0) {
            console.log("✅ Shift coverage request verified in database:", verifyData[0]);
            toast.success("Shift coverage request sent and saved successfully");
          } else {
            console.warn("⚠️ Could not verify request was saved - not found in database");
          }
        } catch (error) {
          console.error("Verification error:", error);
        }
      }, 2000);
      
      setIsLoading(false);
      setIsOpen(false);
      onRequestSent(); // Refresh the list after sending
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
