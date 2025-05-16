
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
          We've detected an issue that's preventing you from staying on the Messages tab.
          This could be due to data loading conflicts or browser caching issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={attemptRecovery} 
            size="sm" 
            variant="outline" 
            className="bg-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Fix Navigation Issue
          </Button>
          <Button
            onClick={() => {
              // Force a full recovery by directly setting the URL with the recovery parameter
              const recoveryUrl = '/communication?tab=messages&recovery=true&ts=' + Date.now();
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
