
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";
import { Button } from "@/components/ui/button";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

interface EmployeeShiftDetailsDialogProps {
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
  const { employees } = useEmployeeDirectory();
  
  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shift Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </span>
            <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
          </div>
          
          {shifts.length > 0 && shifts[0].employeeId && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
              </span>
              <span>Employee: {getEmployeeName(shifts[0].employeeId)}</span>
            </div>
          )}
          
          <h3 className="font-medium">Scheduled Shifts</h3>
          
          <div className="space-y-2">
            {shifts.map((shift, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-accent/20 rounded-md">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                </span>
                {shift.notes && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {shift.notes}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => onClose()}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
