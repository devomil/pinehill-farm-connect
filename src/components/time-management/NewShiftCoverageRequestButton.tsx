
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
  const [validatedEmployees, setValidatedEmployees] = useState<User[]>([]);
  const { sendMessage } = useCommunications(false); // Important: set to false to include shift coverage

  // Check if there are available employees
  const hasAvailableEmployees = allEmployees && allEmployees
    .filter(emp => emp.id !== currentUser.id)
    .length > 0;
  
  // Pre-validate employees from the directory
  React.useEffect(() => {
    if (!allEmployees || allEmployees.length === 0) {
      return;
    }
    
    // Filter out the current user
    const employeesToValidate = allEmployees.filter(emp => emp.id !== currentUser.id);
    console.log(`Pre-validating ${employeesToValidate.length} employees for shift coverage`);
    
    // Query the profiles table to get valid employees
    const validateEmployees = async () => {
      try {
        // Get all profiles from the database
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .limit(50);
        
        if (error) {
          console.error("Error fetching profiles:", error);
          setValidatedEmployees(employeesToValidate); // Fallback to unvalidated list
          return;
        }
        
        if (!profiles || profiles.length === 0) {
          console.warn("No profiles found in database");
          setValidatedEmployees(employeesToValidate); // Fallback to unvalidated list
          return;
        }
        
        // Match employees from directory with profiles from database
        const validEmployees = employeesToValidate.filter(employee => 
          profiles.some(profile => profile.id === employee.id)
        );
        
        console.log(`Found ${validEmployees.length} valid employees out of ${employeesToValidate.length}`);
        setValidatedEmployees(validEmployees);
      } catch (error) {
        console.error("Error validating employees:", error);
        setValidatedEmployees(employeesToValidate); // Fallback to unvalidated list
      }
    };
    
    validateEmployees();
  }, [allEmployees, currentUser.id]);

  const handleNewRequest = async (formData: NewMessageFormData) => {
    setIsLoading(true);
    
    console.log("Submitting shift coverage request:", formData);
    
    // Validate required fields
    if (!formData.shiftDate || !formData.shiftStart || !formData.shiftEnd) {
      toast.error("Please fill in all shift details");
      setIsLoading(false);
      return;
    }
    
    if (!formData.recipientId) {
      toast.error("Please select an employee to cover your shift");
      setIsLoading(false);
      return;
    }
    
    // Validate selected employee exists in our validated list
    const isValidEmployee = validatedEmployees.some(emp => emp.id === formData.recipientId);
    
    if (!isValidEmployee) {
      toast.error("Selected employee could not be verified. Please select another employee.");
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
      await sendMessage(requestData);
      toast.success("Shift coverage request sent successfully");
      setIsOpen(false);
      onRequestSent();
    } catch (error: any) {
      console.error("Failed to send shift coverage request:", error);
      toast.error(error.message || "Failed to send request");
    } finally {
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
