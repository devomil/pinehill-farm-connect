
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { WorkShift } from "@/types/workSchedule";
import { Label } from "@/components/ui/label";

interface ShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: WorkShift;
  isEditMode: boolean;
  onSave: (shift: WorkShift) => void;
  onDelete: (shiftId: string) => void;
}

export const ShiftDialog: React.FC<ShiftDialogProps> = ({
  isOpen,
  onClose,
  shift,
  isEditMode,
  onSave,
  onDelete,
}) => {
  const [editedShift, setEditedShift] = useState<WorkShift>({...shift});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedShift(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setEditedShift(prev => ({
      ...prev,
      isRecurring: checked,
    }));
  };
  
  const handleSave = () => {
    onSave(editedShift);
  };
  
  const handleDelete = () => {
    onDelete(shift.id);
  };
  
  // Format the date for display
  const formattedDate = format(new Date(shift.date), "MMMM d, yyyy");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Shift" : "Add Shift"} for {formattedDate}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={editedShift.startTime}
                onChange={handleInputChange}
                className="pointer-events-auto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={editedShift.endTime}
                onChange={handleInputChange}
                className="pointer-events-auto"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={editedShift.isRecurring}
              onCheckedChange={handleCheckboxChange}
              className="pointer-events-auto"
            />
            <label
              htmlFor="isRecurring"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Recurring Shift
            </label>
          </div>
          
          {editedShift.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringPattern">Recurring Pattern</Label>
              <select
                id="recurringPattern"
                name="recurringPattern"
                value={editedShift.recurringPattern || "weekly"}
                onChange={(e) => {
                  setEditedShift(prev => ({
                    ...prev,
                    recurringPattern: e.target.value,
                  }));
                }}
                className="w-full p-2 border rounded"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={editedShift.notes || ""}
              onChange={handleInputChange}
              className="pointer-events-auto"
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <div>
            {isEditMode && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="mr-2"
              >
                Delete
              </Button>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
