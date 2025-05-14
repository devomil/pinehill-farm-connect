
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { WorkShift } from "@/types/workSchedule";

export interface EmployeeShiftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: WorkShift[];
  selectedDate?: Date;
}

export const EmployeeShiftDetailsDialog: React.FC<EmployeeShiftDetailsDialogProps> = ({
  isOpen,
  onClose,
  shifts,
  selectedDate
}) => {
  if (!selectedDate) return null;
  
  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shift Details for {formattedDate}</DialogTitle>
          <DialogDescription>
            {shifts.length === 0 
              ? "No shifts scheduled for this day." 
              : `${shifts.length} shift${shifts.length > 1 ? 's' : ''} scheduled`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {shifts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No shifts found for this date.</p>
          ) : (
            shifts.map(shift => (
              <div key={shift.id} className="border rounded-md p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Start Time</div>
                  <div>{shift.startTime}</div>
                  
                  <div className="text-muted-foreground">End Time</div>
                  <div>{shift.endTime}</div>
                  
                  {shift.notes && (
                    <>
                      <div className="text-muted-foreground">Notes</div>
                      <div>{shift.notes}</div>
                    </>
                  )}
                  
                  {shift.isRecurring && (
                    <>
                      <div className="text-muted-foreground">Recurring</div>
                      <div>{shift.recurringPattern || "Weekly"}</div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
