
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShiftDetailsForm } from "@/components/communications/ShiftDetailsForm";
import { User } from "@/types";
import { RecipientSelect } from "@/components/communications/RecipientSelect";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "@/hooks/communications/useSendMessage";
import { toast } from "sonner";

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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Request Shift Coverage</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Shift Coverage Request</DialogTitle>
          <DialogDescription>
            Request another employee to cover your shift
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="recipient">Select Employee</Label>
            <RecipientSelect
              employees={allEmployees.filter(emp => emp.id !== currentUser.id)}
              value={recipientId}
              onChange={setRecipientId}
            />
          </div>

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
            <Button onClick={handleSubmit} disabled={!recipientId || !message || !shiftDate || !shiftStart || !shiftEnd}>
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
