
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { NavigationRecoveryButton } from "@/components/debug/NavigationRecoveryButton";

interface NavigationWarningProps {
  hasLoopDetected: boolean;
  attemptRecovery: () => void;
}

export const NavigationWarning: React.FC<NavigationWarningProps> = ({
  hasLoopDetected,
  attemptRecovery
}) => {
  if (!hasLoopDetected) return null;
  
  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <NavigationRecoveryButton 
            onRecover={attemptRecovery} 
            loopDetected={true}
          />
        </div>
      </div>
      
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Navigation loop detected in the Messages tab. Use the "Fix Navigation Loop" button above 
          or add "?recovery=true" to the URL.
        </AlertDescription>
      </Alert>
    </>
  );
};
