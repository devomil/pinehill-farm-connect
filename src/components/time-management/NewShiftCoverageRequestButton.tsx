
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShiftDetailsForm } from "@/components/communications/ShiftDetailsForm";
import { User } from "@/types";
import { RecipientSelect } from "@/components/communications/RecipientSelect";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSendMessage } from "@/hooks/communications/useSendMessage";
import { toast } from "sonner";
import { AlertCircle, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewShiftCoverageRequestButtonProps {
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
}

export const NewShiftCoverageRequestButton: React.FC<NewShiftCoverageRequestButtonProps> = ({
  currentUser,
  allEmployees,
  onRequestSent
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipientId, setRecipientId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>("");
  const [shiftStart, setShiftStart] = useState<string>("");
  const [shiftEnd, setShiftEnd] = useState<string>("");

  const sendMessageMutation = useSendMessage(currentUser);
  
  // Log available employees
  useEffect(() => {
    console.log(`NewShiftCoverageRequestButton - Available employees: ${allEmployees.length}`);
  }, [allEmployees]);

  const handleSubmit = async () => {
    if (!recipientId || !message || !shiftDate || !shiftStart || !shiftEnd) {
      toast.error("Please fill in all fields");
      return;
    }

    // Find Jackie's user record for CC
    const jackieUser = allEmployees.find(emp => emp.email === 'jackie@pinehillfarm.co') || null;

    try {
      sendMessageMutation.mutate({
        recipientId,
        message,
        type: "shift_coverage",
        adminCc: jackieUser?.id,
        shiftDetails: {
          original_employee_id: currentUser.id,
          covering_employee_id: recipientId,
          shift_date: shiftDate,
          shift_start: shiftStart,
          shift_end: shiftEnd
        }
      });

      toast.success("Shift coverage request sent successfully");
      setDialogOpen(false);
      resetForm();
      onRequestSent();
    } catch (error) {
      console.error("Error sending shift coverage request:", error);
      toast.error("Failed to send shift coverage request");
    }
  };

  const resetForm = () => {
    setRecipientId("");
    setMessage("");
    setShiftDate("");
    setShiftStart("");
    setShiftEnd("");
  };

  // Filter out the current user from the employee list
  const availableEmployees = allEmployees.filter(emp => emp.id !== currentUser.id);
  const hasAvailableEmployees = availableEmployees.length > 0;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasAvailableEmployees}>
          {hasAvailableEmployees ? "Request Shift Coverage" : "No Available Employees"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Shift Coverage Request</DialogTitle>
          <DialogDescription>
            Request another employee to cover your shift
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!hasAvailableEmployees ? (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There are no other employees in the system to request shift coverage from.
                <Button variant="link" className="p-0 h-auto ml-2">
                  <UserPlus className="h-4 w-4 mr-1" /> Add Employees
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <RecipientSelect
                employees={availableEmployees}
                value={recipientId}
                onChange={setRecipientId}
              />

              <ShiftDetailsForm
                shiftDate={shiftDate}
                shiftStart={shiftStart}
                shiftEnd={shiftEnd}
                onShiftDateChange={setShiftDate}
                onShiftStartChange={setShiftStart}
                onShiftEndChange={setShiftEnd}
              />

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please let me know if you can cover my shift..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!recipientId || !message || !shiftDate || !shiftStart || !shiftEnd}
                >
                  Send Request
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
