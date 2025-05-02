
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
  const { sendMessage } = useCommunications();

  // Check if there are available employees
  const hasAvailableEmployees = allEmployees && allEmployees
    .filter(emp => emp.id !== currentUser.id)
    .length > 0;

  const handleNewRequest = (formData: NewMessageFormData) => {
    setIsLoading(true);
    
    console.log("Submitting shift coverage request:", formData);
    
    // Create properly formatted shift coverage request
    const requestData = {
      recipientId: formData.recipientId,
      message: formData.message,
      type: "shift_coverage" as const,
      shiftDetails: {
        original_employee_id: currentUser.id,
        covering_employee_id: formData.recipientId,
        shift_date: formData.shiftDate || "",
        shift_start: formData.shiftStart || "", 
        shift_end: formData.shiftEnd || ""
      }
    };
    
    console.log("Sending shift coverage request with data:", requestData);
    
    // Use the sendMessage function from useCommunications hook
    sendMessage(requestData);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      onRequestSent(); // Refresh the list after sending
      toast.success("Shift coverage request sent successfully");
    }, 500);
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
