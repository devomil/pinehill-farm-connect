
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface NavigationWarningProps {
  hasLoopDetected: boolean;
  attemptRecovery: () => void;
}

export const NavigationWarning: React.FC<NavigationWarningProps> = ({
  hasLoopDetected,
  attemptRecovery
}) => {
  if (!hasLoopDetected) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Navigation Issue Detected</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          There's an issue with the Direct Messages tab navigation. This could be happening because
          of route conflicts or state management issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              attemptRecovery();
            }} 
            size="sm" 
            variant="outline" 
            className="bg-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Fix Navigation Issue
          </Button>
          <Button
            onClick={() => {
              // Forced recovery with special flag
              window.sessionStorage.setItem('communication_recovery', 'true');
              const recoveryUrl = `/communication?tab=messages&recovery=true&ts=${Date.now()}`;
              window.location.href = recoveryUrl;
            }}
            size="sm"
            variant="default"
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Force Full Recovery
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
