
import React, { useState } from "react";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useShiftCoverage } from "./useShiftCoverage";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

interface ShiftCoverageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
}

export function ShiftCoverageDialog({
  open,
  onOpenChange,
  currentUser,
  allEmployees,
  onRequestSent
}: ShiftCoverageDialogProps) {
  const {
    form,
    onSubmit,
    isSubmitting,
    submitError,
    employees
  } = useShiftCoverage();

  // Local state for the form fields
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Filter out the current user from the employee list
  const filteredEmployees = allEmployees.filter(emp => emp.id !== currentUser.id);

  // Check if admin info is available
  const adminId = "admin-jackie"; // Placeholder or use from a context/props
  const isLoadingAdmin = false; // Could be dynamic if you're fetching admin info

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      covering_employee_id: form.getValues("covering_employee_id"),
      shift_date: date.toISOString().split('T')[0],
      shift_start: startTime,
      shift_end: endTime
    });
    
    if (onRequestSent) {
      onRequestSent();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleFormSubmit}>
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
                value={form.getValues("covering_employee_id")} 
                onValueChange={(value) => form.setValue("covering_employee_id", value)}
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
                {isLoadingAdmin ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading admin info...
                  </span>
                ) : adminId ? (
                  "Jackie Phillips (jackie@pinehillfarm.co)"
                ) : (
                  "Admin information not available"
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isLoadingAdmin}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingAdmin}>
              {isSubmitting ? (
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
  );
}
