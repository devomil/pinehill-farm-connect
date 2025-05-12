
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface UploadErrorProps {
  error: string | null;
}

export const UploadError: React.FC<UploadErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTitle>Upload Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
