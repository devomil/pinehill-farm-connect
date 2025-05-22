
import React from "react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onAssignWeekday: () => void;
  onAssignWeekend: () => void;
  onCheckConflicts: () => void;
  onAutoAssignCoverage: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAssignWeekday,
  onAssignWeekend,
  onCheckConflicts,
  onAutoAssignCoverage,
}) => {
  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <Button size="sm" onClick={onAssignWeekday}>
        Assign Weekday Shifts
      </Button>
      <Button size="sm" onClick={onAssignWeekend}>
        Assign Weekend Shifts
      </Button>
      <Button size="sm" variant="outline" onClick={onCheckConflicts}>
        Check Time-Off Conflicts
      </Button>
      <Button size="sm" variant="outline" onClick={onAutoAssignCoverage}>
        Auto-Assign Coverage
      </Button>
    </div>
  );
};
