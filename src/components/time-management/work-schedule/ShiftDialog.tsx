
import React from "react";
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
  onOpenChange: (open: boolean) => void;
  currentShift: WorkShift | null;
  selectedDate?: Date;
  isSelectingMultiple: boolean;
  selectedDatesCount: number;
  onSave: () => void;
  onDelete: () => void;
  onApplyToMultiple: () => void;
  onShiftChange: (field: string, value: any) => void;
}

export const ShiftDialog: React.FC<ShiftDialogProps> = ({
  isOpen,
  onOpenChange,
  currentShift,
  selectedDate,
  isSelectingMultiple,
  selectedDatesCount,
  onSave,
  onDelete,
  onApplyToMultiple,
  onShiftChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSelectingMultiple
              ? `Schedule for ${selectedDatesCount} selected days`
              : `Schedule for ${selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={currentShift?.startTime || ""}
                onChange={(e) => onShiftChange("startTime", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={currentShift?.endTime || ""}
                onChange={(e) => onShiftChange("endTime", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={currentShift?.notes || ""}
              onChange={(e) => onShiftChange("notes", e.target.value)}
              placeholder="Add any special instructions or notes"
            />
          </div>
          
          {!isSelectingMultiple && (
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={currentShift?.isRecurring || false}
                onCheckedChange={(checked) => onShiftChange("isRecurring", checked)}
              />
              <Label htmlFor="recurring">Recurring weekly</Label>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {!isSelectingMultiple && (
              <Button
                type="button"
                variant="outline"
                onClick={onApplyToMultiple}
              >
                Apply to Multiple Days
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isSelectingMultiple && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              onClick={onSave}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
