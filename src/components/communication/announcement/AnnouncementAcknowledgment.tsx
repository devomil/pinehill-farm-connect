
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface AnnouncementAcknowledgmentProps {
  id: string;
  isAcknowledged?: boolean;
  onAcknowledge?: () => void;
}

export const AnnouncementAcknowledgment = ({
  id,
  isAcknowledged = false,
  onAcknowledge,
}: AnnouncementAcknowledgmentProps) => {
  // Track local state for immediate UI feedback
  const [isChecked, setIsChecked] = useState(isAcknowledged);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render if no acknowledgment handler is provided
  if (!onAcknowledge) return null;

  const handleAcknowledge = async (checked: boolean) => {
    // Only proceed if the checkbox is being checked and isn't already acknowledged
    if (!checked || isAcknowledged) return;
    
    try {
      setIsSubmitting(true);
      // Update local UI state for immediate feedback
      setIsChecked(true);
      
      console.log("Acknowledging announcement:", id);
      await onAcknowledge();
    } catch (error) {
      // Revert UI state if there was an error
      setIsChecked(false);
      console.error("Error acknowledging announcement:", error);
      toast({
        title: "Failed to acknowledge",
        description: "There was an issue acknowledging this announcement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded">
      <Checkbox
        id={`ack-${id}`}
        checked={isChecked || isAcknowledged}
        onCheckedChange={handleAcknowledge}
        disabled={isAcknowledged || isSubmitting}
        className="cursor-pointer"
      />
      <label 
        htmlFor={`ack-${id}`} 
        className={`text-sm cursor-pointer select-none ${isAcknowledged ? 'text-muted-foreground' : ''}`}
      >
        I acknowledge that I have read and understood this announcement
        {isAcknowledged && " (Acknowledged)"}
      </label>
    </div>
  );
};
