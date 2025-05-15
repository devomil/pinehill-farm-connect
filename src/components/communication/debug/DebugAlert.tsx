
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DebugAlertProps {
  message: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const DebugAlert: React.FC<DebugAlertProps> = ({
  message,
  description,
  variant = "destructive"
}) => {
  return (
    <Alert variant={variant} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {message}
        {description && <p className="mt-1 text-xs">{description}</p>}
      </AlertDescription>
    </Alert>
  );
};
