
import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkShift } from "@/types/workSchedule";

interface EmployeeShiftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | undefined;
  shifts: WorkShift[];
}

export const EmployeeShiftDetailsDialog: React.FC<EmployeeShiftDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  shifts
}) => {
  if (!selectedDate) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Schedule for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            {shifts.map((shift, index) => (
              <div key={index} className="border rounded-md p-4 space-y-2">
                <div className="font-medium">
                  Shift {index + 1}: {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                </div>
                {shift.isRecurring && (
                  <div className="text-sm bg-primary/10 inline-block px-2 py-1 rounded">
                    Weekly recurring
                  </div>
                )}
                {shift.notes && (
                  <div className="text-sm mt-2">
                    <div className="font-medium">Notes:</div>
                    <p className="text-muted-foreground">{shift.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
