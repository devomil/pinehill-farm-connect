
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface AnnouncementAcknowledgmentProps {
  id: string;
  isAcknowledged?: boolean;
  onAcknowledge?: () => void;
}

export const AnnouncementAcknowledgment = ({
  id,
  isAcknowledged,
  onAcknowledge,
}: AnnouncementAcknowledgmentProps) => {
  // Don't render if no acknowledgment handler is provided or if already acknowledged
  if (!onAcknowledge || isAcknowledged) return null;

  return (
    <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded">
      <Checkbox
        id={`ack-${id}`}
        checked={isAcknowledged}
        onCheckedChange={onAcknowledge}
      />
      <label htmlFor={`ack-${id}`} className="text-sm">
        I acknowledge that I have read and understood this announcement
      </label>
    </div>
  );
};
