
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
    
  // Pre-validate employee data for potential issues
  useEffect(() => {
    const validateEmployees = async () => {
      try {
        // Get valid user IDs directly from profiles table
        const { data: validProfiles, error } = await supabase
          .from('profiles')
          .select('id')
          .neq('id', currentUser.id);
        
        if (error) {
          console.error("Error pre-validating employees:", error);
          return;
        }
        
        // Create a set of valid IDs for efficient lookup
        const validIds = new Set(validProfiles.map(profile => profile.id));
        console.log(`Found ${validIds.size} valid employee IDs in database`);
        
        // Filter the employees list to only include validated IDs
        const validated = allEmployees.filter(emp => 
          emp.id !== currentUser.id && validIds.has(emp.id)
        );
        
        console.log(`After validation: ${validated.length} valid employees available`);
        setValidatedEmployees(validated);
      } catch (error) {
        console.error("Error during employee validation:", error);
        // Fallback to regular filtering
        setValidatedEmployees(allEmployees.filter(emp => 
          emp.id && emp.id !== currentUser.id && emp.id.length > 10
        ));
      }
    };
    
    if (allEmployees && allEmployees.length > 0) {
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

    // Enhanced recipient validation
    try {
      // First check in our pre-validated list
      const recipientExists = validatedEmployees.some(emp => emp.id === formData.recipientId);
      
      if (!recipientExists) {
        console.error("Selected recipient not in validated list, attempting direct database check");
        
        // Double-check directly with the database
        const { data: profileCheck, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', formData.recipientId)
          .single();
          
        if (error || !profileCheck) {
          console.error("Database check failed:", error);
          toast.error("Cannot find recipient in database. Please try another employee.");
          setIsLoading(false);
          return;
        } else {
          console.log("Recipient verified in database:", profileCheck);
        }
      } else {
        console.log("Recipient exists in pre-validated list");
      }
    } catch (error) {
      console.error("Error verifying recipient:", error);
      toast.error("Error verifying recipient. Please try again.");
      setIsLoading(false);
      return;
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
            // Try a different more permissive query
            const { data: backupData } = await supabase
              .from('shift_coverage_requests')
              .select('*')
              .eq('original_employee_id', currentUser.id)
              .order('created_at', { ascending: false })
              .limit(3);
              
            if (backupData && backupData.length > 0) {
              console.log("Found recent requests:", backupData);
              toast.success("Shift coverage request sent successfully");
            }
          }
        } catch (error) {
          console.error("Verification error:", error);
        }
      }, 2000);
      
      setIsLoading(false);
      setIsOpen(false);
      onRequestSent(); // Refresh the list after sending
    } catch (error: any) {
      console.error("Error sending shift coverage request:", error);
      toast.error(`Failed to send shift coverage request: ${error.message}`);
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
