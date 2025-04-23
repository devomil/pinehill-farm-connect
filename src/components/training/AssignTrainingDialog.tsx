
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmployeeSelector } from "@/components/communication/EmployeeSelector";
import { Training, User } from "@/types";

interface AssignTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainings: Training[];
  selectedTrainingId: string;
  setSelectedTrainingId: (id: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  unfilteredEmployees: User[];
  onAssign: () => void;
  loading: boolean;
}

export const AssignTrainingDialog: React.FC<AssignTrainingDialogProps> = ({
  open,
  onOpenChange,
  trainings,
  selectedTrainingId,
  setSelectedTrainingId,
  selectedUserIds,
  setSelectedUserIds,
  unfilteredEmployees,
  onAssign,
  loading
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assign Training</DialogTitle>
          <DialogDescription>
            Assign a training course to one or more employees
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Training</label>
            <Select
              value={selectedTrainingId}
              onValueChange={setSelectedTrainingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a training" />
              </SelectTrigger>
              <SelectContent>
                {trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employees</label>
            <EmployeeSelector
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              allEmployees={unfilteredEmployees}
            />
            
            {selectedUserIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedUserIds.map(userId => {
                  const employee = unfilteredEmployees.find(e => e.id === userId);
                  return employee ? (
                    <Badge key={userId} variant="secondary">
                      {employee.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onAssign} 
            disabled={!selectedTrainingId || selectedUserIds.length === 0 || loading}
          >
            {loading ? "Assigning..." : "Assign Training"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
