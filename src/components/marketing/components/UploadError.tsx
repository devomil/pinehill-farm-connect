
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
  
  if (error.includes("exceeded the maximum allowed size")) {
    errorTitle = "File Size Error";
    errorMessage = "The file is too large. Please try a smaller file (under 200MB) or compress the content.";
  } else if (error.includes("Payload too large")) {
    errorTitle = "File Size Error";
    errorMessage = "The file is too large for the server to process. Please try a smaller file or compress the content.";
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};
