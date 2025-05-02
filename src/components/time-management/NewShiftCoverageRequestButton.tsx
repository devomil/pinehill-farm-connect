
import React, { useState, useEffect } from "react";
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
import { validateEmployeeExists } from "@/hooks/communications/services/recipient/recipientLookupService";

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
  const [validatedEmployees, setValidatedEmployees] = useState<User[]>([]);
  const { sendMessage } = useCommunications(false); // Important: set to false to include shift coverage

  // Check if there are available employees
  const hasAvailableEmployees = allEmployees && allEmployees
    .filter(emp => emp.id !== currentUser.id)
    .length > 0;
    
  // Enhanced employee validation with more reliable validation
  useEffect(() => {
    const validateEmployees = async () => {
      if (!allEmployees || allEmployees.length === 0 || !currentUser?.id) {
        return;
      }
      
      try {
        // Filter out current user and ensure we have valid employee IDs
        const employeesToValidate = allEmployees.filter(emp => 
          emp.id && emp.id !== currentUser.id && emp.id.length > 10
        );
        
        console.log(`Validating ${employeesToValidate.length} potential recipients...`);
        
        // Use a batch approach to validate employees more efficiently
        const validatedEmployeeList: User[] = [];
        
        for (const employee of employeesToValidate) {
          const isValid = await validateEmployeeExists(employee.id);
          if (isValid) {
            validatedEmployeeList.push(employee);
          }
        }
        
        console.log(`Found ${validatedEmployeeList.length} valid employees after validation`);
        setValidatedEmployees(validatedEmployeeList);
      } catch (error) {
        console.error("Error during employee validation:", error);
        // Fallback to regular filtering
        setValidatedEmployees(allEmployees.filter(emp => 
          emp.id && emp.id !== currentUser.id && emp.id.length > 10
        ));
      }
    };
    
    if (allEmployees && allEmployees.length > 0 && currentUser?.id) {
      validateEmployees();
    }
  }, [allEmployees, currentUser]);

  const handleNewRequest = async (formData: NewMessageFormData) => {
    setIsLoading(true);
    
    console.log("Submitting shift coverage request:", formData);
    
    if (!formData.shiftDate || !formData.shiftStart || !formData.shiftEnd) {
      toast.error("Missing required shift details");
      setIsLoading(false);
      return;
    }
    
    if (!formData.recipientId) {
      toast.error("Please select an employee to cover your shift");
      setIsLoading(false);
      return;
    }

    // Verify recipient exists before sending
    try {
      const recipientExists = await validateEmployeeExists(formData.recipientId);
      
      if (!recipientExists) {
        // Try finding the recipient in the validated employees list
        const foundInList = validatedEmployees.some(emp => emp.id === formData.recipientId);
        
        if (!foundInList) {
          toast.error("Selected employee could not be verified. Please try again.");
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error verifying recipient:", error);
    }
    
    // Create properly formatted shift coverage request that matches the schema
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
      toast.success("Shift coverage request sent successfully");
      setIsLoading(false);
      setIsOpen(false);
      onRequestSent(); // Refresh the list after sending
    } catch (error: any) {
      console.error("Error sending shift coverage request:", error);
      toast.error(`Failed to send request: ${error.message}`);
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
          employees={validatedEmployees.length > 0 ? validatedEmployees : allEmployees.filter(emp => emp.id !== currentUser.id)}
          onSubmit={handleNewRequest}
          isLoading={isLoading}
          currentUser={currentUser}
        />
      </SheetContent>
    </Sheet>
  );
};
