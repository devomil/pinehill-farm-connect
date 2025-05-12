
import React from "react";
import { CommunicationErrorDisplay } from "@/components/communication/CommunicationErrorDisplay";

interface AnnouncementErrorHandlerProps {
  error: Error | null;
  onRefresh: () => void;
}

export const AnnouncementErrorHandler: React.FC<AnnouncementErrorHandlerProps> = ({
  error,
  onRefresh
}) => {
  if (!error) return null;
  
  return (
    <CommunicationErrorDisplay 
      error={error} 
      onRefresh={onRefresh} 
    />
  );
};
