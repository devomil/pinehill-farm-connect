import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface AnnouncementAcknowledgmentProps {
  id: string;
  isAcknowledged?: boolean;
  isRead?: boolean;
  onAcknowledge?: (announcementId: string) => Promise<void>;
  onMarkAsRead?: (announcementId: string) => Promise<void>;
}

export const AnnouncementAcknowledgment = ({
  id,
  isAcknowledged = false,
  isRead = false,
  onAcknowledge,
  onMarkAsRead,
}: AnnouncementAcknowledgmentProps) => {
  // Track local state for immediate UI feedback
  const [isChecked, setIsChecked] = useState(isAcknowledged);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Update local state when props change
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
      
      // Keep the checked state - don't revert it after the operation completes
      // The database update should trigger a fetch that will update isAcknowledged prop
      toast.success("Announcement acknowledged", "Thank you for acknowledging this announcement");
    } catch (error) {
      // Revert UI state if there was an error
      setIsChecked(false);
      console.error("Error acknowledging announcement:", error);
      toast.error("Failed to acknowledge announcement", "An error occurred while saving your acknowledgment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!onMarkAsRead || isRead) return;
    
    try {
      setIsMarkingRead(true);
      console.log("Marking announcement as read:", id);
      await onMarkAsRead(id);
      toast.success("Announcement marked as read", "Thank you for reviewing this announcement");
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      toast.error("Failed to mark as read", "An error occurred");
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div className="space-y-3 mt-4 p-3 bg-muted rounded">
      <div className="flex items-start gap-2">
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
      
      {!isRead && onMarkAsRead && (
        <div className="flex justify-end">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            className="flex items-center gap-1"
          >
            <Check className="h-3.5 w-3.5" /> 
            Mark as Read
          </Button>
        </div>
      )}
      
      {isRead && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="h-3.5 w-3.5 text-green-500" /> 
            Marked as read
          </span>
        </div>
      )}
    </div>
  );
};
