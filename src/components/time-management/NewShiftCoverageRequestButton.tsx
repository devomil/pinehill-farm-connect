
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const hasAvailableEmployees = allEmployees && allEmployees.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientId) {
      toast.error("Please select an employee to request coverage from");
      return;
    }
    
    if (!shiftDate || !shiftStart || !shiftEnd) {
      toast.error("Please complete all shift details");
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data: supabaseData, error: supabaseError } = await supabase.functions.invoke("send-message", {
        body: {
          recipientId,
          message: message || "Could you please cover my shift?",
          type: "shift_coverage",
          shiftDetails: {
            original_employee_id: currentUser.id,
            covering_employee_id: recipientId,
            shift_date: shiftDate,
            shift_start: shiftStart,
            shift_end: shiftEnd,
          },
        },
      });

      if (supabaseError) throw supabaseError;
      
      toast.success("Shift coverage request sent successfully");
      setOpen(false);
      onRequestSent();
      
      // Reset form
      setRecipientId("");
      setMessage("");
      setShiftDate("");
      setShiftStart("");
      setShiftEnd("");
    } catch (error: any) {
      console.error("Error sending shift coverage request:", error);
      toast.error(error.message || "Failed to send shift coverage request");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasAvailableEmployees}>
          <Plus className="h-4 w-4 mr-2" /> New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Shift Coverage</DialogTitle>
        </DialogHeader>
        
        {!hasAvailableEmployees ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No other employees are available to request shift coverage from.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Request Coverage From</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name || employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shift-date">Shift Date</Label>
              <Input
                id="shift-date"
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-start">Start Time</Label>
                <Input
                  id="shift-start"
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">End Time</Label>
                <Input
                  id="shift-end"
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add details about your shift coverage request"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
