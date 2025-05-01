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
import { useMessageSending } from "@/hooks/communications/useMessageSending";
import { toast } from "sonner";
import { NewShiftCoverageRequestForm } from "./shift-coverage/NewShiftCoverageRequestForm";

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
  const { sendMessage, isLoading } = useMessageSending();

  // Check if there are available employees
  const hasAvailableEmployees = allEmployees && allEmployees.length > 0;

  const handleNewRequest = (formData: NewMessageFormData) => {
    // Create shift coverage request
    sendMessage({
      recipientId: formData.recipientId,
      message: formData.message,
      type: "shift_coverage",
      shiftDetails: {
        shift_date: formData.shiftDate || "",
        shift_start: formData.shiftStart || "",
        shift_end: formData.shiftEnd || "",
      },
    })
      .then(() => {
        setIsOpen(false);
        toast.success("Shift coverage request sent successfully");
        onRequestSent(); // Refresh the list after sending
      })
      .catch((error) => {
        console.error("Error sending shift coverage request:", error);
        toast.error("Failed to send shift coverage request");
      });
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
