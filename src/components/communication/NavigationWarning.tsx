
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
          There's an issue with the Direct Messages tab navigation. The system will try to
          automatically stabilize the interface.
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
              // Clear any lingering state first
              window.sessionStorage.removeItem('communication_recovery');
              
              // Set fresh recovery flag
              window.sessionStorage.setItem('communication_recovery', 'true');
              
              // Generate a unique recovery URL with timestamp
              const recoveryUrl = `/communication?tab=messages&recovery=true&ts=${Date.now()}`;
              
              // Force a clean navigation
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
