
import React, { useState, useEffect } from "react";
import { WorkShift } from "@/types/workSchedule";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  onDelete
}) => {
  const [currentShift, setCurrentShift] = useState<WorkShift>(shift);
  
  // Reset current shift when input shift changes
  useEffect(() => {
    setCurrentShift(shift);
  }, [shift]);
  
  const handleFieldChange = (field: keyof WorkShift, value: any) => {
    setCurrentShift({
      ...currentShift,
      [field]: value
    });
  };
  
  const handleSave = () => {
    onSave(currentShift);
  };
  
  const handleDelete = () => {
    onDelete(currentShift.id);
  };
  
  const formattedDate = format(new Date(currentShift.date), "MMMM d, yyyy");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? `Edit Shift - ${formattedDate}` : `New Shift - ${formattedDate}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={currentShift.startTime}
                onChange={(e) => handleFieldChange("startTime", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={currentShift.endTime}
                onChange={(e) => handleFieldChange("endTime", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={currentShift.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Add any special instructions or notes"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={currentShift.isRecurring}
              onCheckedChange={(checked) => handleFieldChange("isRecurring", checked)}
            />
            <Label htmlFor="recurring">Recurring weekly</Label>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          {isEditMode && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
