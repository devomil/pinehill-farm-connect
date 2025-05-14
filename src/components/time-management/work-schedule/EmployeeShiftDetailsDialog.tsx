
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { WorkShift } from "@/types/workSchedule";

export interface EmployeeShiftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  shifts: WorkShift[];
}

export const EmployeeShiftDetailsDialog: React.FC<EmployeeShiftDetailsDialogProps> = ({
  isOpen,
  onClose,
  date,
  shifts,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shift Details - {format(date, "EEEE, MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {shifts.length > 0 ? (
            <div className="space-y-3">
              {shifts.map((shift, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Shift {index + 1}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Time: {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}</div>
                    {shift.isRecurring && (
                      <div>Recurring: {shift.recurringPattern || "Weekly"}</div>
                    )}
                    {shift.notes && <div>Notes: {shift.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No shifts scheduled for this day.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
