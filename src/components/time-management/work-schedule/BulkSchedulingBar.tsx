
import React from "react";
import { Button } from "@/components/ui/button";

interface BulkSchedulingBarProps {
  isSelectingMultiple: boolean;
  selectedDatesCount: number;
  onCancel: () => void;
  onApply: () => void;
}

export const BulkSchedulingBar: React.FC<BulkSchedulingBarProps> = ({
  isSelectingMultiple,
  selectedDatesCount,
  onCancel,
  onApply
}) => {
  if (!isSelectingMultiple) return null;
  
  return (
    <div className="bg-accent/20 p-3 rounded-md flex justify-between items-center">
      <div>
        <h3 className="font-medium">Bulk Scheduling Mode</h3>
        <p className="text-sm text-muted-foreground">Select multiple days to apply the same schedule</p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onApply}
          disabled={selectedDatesCount === 0}
        >
          Apply to {selectedDatesCount} day{selectedDatesCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
};
