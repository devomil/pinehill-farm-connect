
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, CalendarPlus, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useCommunications } from "@/hooks/useCommunications";
import { toast } from "sonner";

type NewShiftCoverageRequestButtonProps = {
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
};

export function NewShiftCoverageRequestButton({
  currentUser,
  allEmployees,
  onRequestSent
}: NewShiftCoverageRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  const { sendMessage } = useCommunications();
  const [isSending, setIsSending] = useState(false);
  
  // Filter out the current user and any employees that might be inactive
  // Without relying on a 'disabled' property that doesn't exist in the User type
  const filteredEmployees = allEmployees.filter(
    (employee) => employee.id !== currentUser.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation with custom error messages
    if (!selectedEmployeeId) {
      toast.error("Please select an employee to cover your shift");
      return;
    }
    
    if (!date) {
      toast.error("Please select a date for your shift");
      return;
    }
    
    if (!startTime) {
      toast.error("Please specify shift start time");
      return;
    }
    
    if (!endTime) {
      toast.error("Please specify shift end time");
      return;
    }
    
    if (!currentUser || !currentUser.id) {
      toast.error("User profile error. Please try logging out and back in.");
      return;
    }
    
    setIsSending(true);
    
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      
      console.log("Sending shift coverage request with data:", {
        recipientId: selectedEmployeeId,
        date: formattedDate,
        startTime,
        endTime,
        message: message || "Could you please cover my shift?",
        currentUserId: currentUser?.id
      });
      
      await sendMessage({
        recipientId: selectedEmployeeId,
        message: message || "Could you please cover my shift?",
        type: "shift_coverage",
        shiftDetails: {
          shift_date: formattedDate,
          shift_start: startTime,
          shift_end: endTime,
          original_employee_id: currentUser.id,
          covering_employee_id: selectedEmployeeId
        },
        // Always set Jackie as the admin CC for shift coverage requests
        adminCc: "jackie@pinehillfarm.co"
      });
      
      toast.success("Shift coverage request sent successfully");
      setOpen(false);
      
      // Reset form
      setSelectedEmployeeId("");
      setMessage("");
      setDate(new Date());
      setStartTime("09:00");
      setEndTime("17:00");
      
      // Notify parent that a request was sent to refresh data
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error("Error sending shift coverage request:", error);
      toast.error(`Failed to send shift coverage request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default">
        <CalendarPlus className="h-4 w-4 mr-2" /> Request Coverage
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Request Shift Coverage</DialogTitle>
              <DialogDescription>
                Request another employee to cover your shift. You will receive a notification when they respond.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Employee
                </Label>
                <Select 
                  value={selectedEmployeeId} 
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className="col-span-3" id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name || employee.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="text-right">
                  End Time
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right align-top mt-2">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any additional details about the shift..."
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  Admin CC
                </div>
                <div className="col-span-3 text-muted-foreground">
                  Jackie Phillips (jackie@pinehillfarm.co)
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
