
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
  useEffect(() => {
    if (!allEmployees || allEmployees.length === 0) {
      return;
    }
    
    // Filter out the current user and get employees to validate
    const employeesToValidate = allEmployees.filter(emp => emp.id !== currentUser.id);
    console.log(`Pre-validating ${employeesToValidate.length} employees for shift coverage`);
    
    // First try using the edge function to get profiles
    const fetchValidEmployees = async () => {
      try {
        // Try edge function first to bypass RLS
        const { data: profiles, error: funcError } = await supabase
          .functions.invoke('get_all_profiles');
          
        if (!funcError && profiles && profiles.length > 0) {
          console.log("Successfully fetched profiles with edge function:", profiles.length);
          
          // Match employees from directory with profiles from edge function
          const validEmployees = employeesToValidate.filter(employee => 
            profiles.some(profile => profile.id === employee.id)
          );
          
          if (validEmployees.length > 0) {
            console.log(`Found ${validEmployees.length} valid employees via edge function`);
            setValidatedEmployees(validEmployees);
            return;
          }
        }
        
        // Fall back to direct query if edge function fails
        const { data: directProfiles, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .not('email', 'is', null)
          .limit(50);
        
        if (error) {
          console.error("Error fetching profiles:", error);
          // Use all employees as fallback if query fails
          setValidatedEmployees(employeesToValidate);
          return;
        }
        
        if (!directProfiles || directProfiles.length === 0) {
          console.warn("No profiles found in database - using all employees");
          setValidatedEmployees(employeesToValidate);
          return;
        }
        
        // Match employees from directory with profiles from database
        const validEmployees = employeesToValidate.filter(employee => 
          directProfiles.some(profile => profile.id === employee.id)
        );
        
        if (validEmployees.length === 0) {
          console.warn("No matching employees found - using all as fallback");
          setValidatedEmployees(employeesToValidate);
        } else {
          console.log(`Found ${validEmployees.length} valid employees through direct query`);
          setValidatedEmployees(validEmployees);
        }
      } catch (error) {
        console.error("Error validating employees:", error);
        // Fall back to using all employees if validation fails
        setValidatedEmployees(employeesToValidate);
      }
    };
    
    fetchValidEmployees();
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
    
    try {
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
