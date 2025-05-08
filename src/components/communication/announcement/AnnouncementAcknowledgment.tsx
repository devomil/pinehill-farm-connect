
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface AnnouncementAcknowledgmentProps {
  id: string;
  isAcknowledged?: boolean;
  onAcknowledge?: (announcementId: string) => Promise<void>;
}

export const AnnouncementAcknowledgment = ({
  id,
  isAcknowledged = false,
  onAcknowledge,
}: AnnouncementAcknowledgmentProps) => {
  // Track local state for immediate UI feedback
  const [isChecked, setIsChecked] = useState(isAcknowledged);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update local state when prop changes
  useEffect(() => {
    setIsChecked(isAcknowledged);
  }, [isAcknowledged]);
  
  // Don't render if no acknowledgment handler is provided
  if (!onAcknowledge) return null;

  const handleAcknowledge = async (checked: boolean | "indeterminate") => {
    // Only proceed if the checkbox is being checked (true) and isn't already acknowledged
    if (checked !== true || isAcknowledged) return;
    
    try {
      setIsSubmitting(true);
      // Update local UI state for immediate feedback
      setIsChecked(true);
      
      console.log("Acknowledging announcement:", id);
      await onAcknowledge(id);
      
      // Toast is now handled in the useAnnouncementAcknowledge hook
    } catch (error) {
      // Revert UI state if there was an error
      setIsChecked(false);
      console.error("Error acknowledging announcement:", error);
      // Error toast is now handled in the useAnnouncementAcknowledge hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-start gap-2 mt-4 p-3 bg-muted rounded">
      <Checkbox
        id={`ack-${id}`}
        checked={isChecked || isAcknowledged}
        onCheckedChange={handleAcknowledge}
        disabled={isAcknowledged || isSubmitting}
        className="cursor-pointer mt-1"
      />
      <Label 
        htmlFor={`ack-${id}`} 
        className={`text-sm cursor-pointer select-none ${isAcknowledged ? 'text-muted-foreground' : ''}`}
      >
        I acknowledge that I have read and understood this announcement
        {isAcknowledged && " (Acknowledged)"}
      </Label>
    </div>
  );
};
