
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatErrorMessage } from "@/utils/errorUtils";

interface UploadErrorProps {
  error: string | null;
}

export const UploadError: React.FC<UploadErrorProps> = ({ error }) => {
  if (!error) return null;
  
  // Extract specific error messages for better user guidance
  let errorTitle = "Upload Error";
  let errorMessage = error;
  
  if (error.includes("exceeded the maximum allowed size") || error.includes("exceeds the")) {
    errorTitle = "File Size Error";
    errorMessage = "The file is too large. Supabase has a 100MB limit for file uploads. Please try a smaller file or compress the content.";
  } else if (error.includes("Payload too large")) {
    errorTitle = "File Size Error";
    errorMessage = "The file is too large for the server to process. Please use a file smaller than 100MB or compress the content.";
  } else if (error.includes("server limit")) {
    errorTitle = "File Size Error";
    errorMessage = "Your file exceeds Supabase's 100MB storage limit. Please try a smaller file or compress the content.";
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};
