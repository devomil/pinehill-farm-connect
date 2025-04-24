
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

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
  // Don't render if no acknowledgment handler is provided
  if (!onAcknowledge) return null;

  const handleAcknowledge = async () => {
    try {
      if (onAcknowledge) {
        console.log("Acknowledging announcement:", id);
        await onAcknowledge();
      }
    } catch (error) {
      console.error("Error acknowledging announcement:", error);
      toast({
        title: "Failed to acknowledge",
        description: "There was an issue acknowledging this announcement",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded">
      <Checkbox
        id={`ack-${id}`}
        checked={isAcknowledged}
        onCheckedChange={handleAcknowledge}
        disabled={isAcknowledged}
      />
      <label 
        htmlFor={`ack-${id}`} 
        className={`text-sm ${isAcknowledged ? 'text-muted-foreground' : ''}`}
      >
        I acknowledge that I have read and understood this announcement
        {isAcknowledged && " (Acknowledged)"}
      </label>
    </div>
  );
};
