
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";
import { Button } from "@/components/ui/button";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EmployeeShiftDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  shifts: WorkShift[];
  onDeleteShift?: (shiftId: string) => void;
}

export const EmployeeShiftDetailsDialog: React.FC<EmployeeShiftDetailsDialogProps> = ({
  isOpen,
  onClose,
  date,
  shifts,
  onDeleteShift,
}) => {
  const { employees } = useEmployeeDirectory();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  
  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId: string): string => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  // Helper function to convert 24h time to 12h time with am/pm
  const convertTo12HourFormat = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hour12}:${minutes} ${period}`;
  };

  const handleDeleteShift = (shiftId: string) => {
    if (!isAdmin) {
      toast("Only administrators can delete shifts");
      return;
    }
    
    if (onDeleteShift) {
      onDeleteShift(shiftId);
      toast("Shift deleted successfully");
    }
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
              <div key={i} className="p-2 bg-accent/20 rounded-md">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {convertTo12HourFormat(shift.startTime.substring(0, 5))} - {convertTo12HourFormat(shift.endTime.substring(0, 5))}
                    </span>
                  </div>
                  
                  {isAdmin && onDeleteShift && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDeleteShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {shift.notes && (
                  <div className="text-xs text-muted-foreground mt-1 ml-6">
                    {shift.notes}
                  </div>
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
