
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bug } from 'lucide-react';

interface SuccessAlertProps {
  activeTab: string;
  hasIssues: boolean;
}

export function SuccessAlert({ activeTab, hasIssues }: SuccessAlertProps) {
  if (activeTab !== 'messages' || hasIssues) return null;

  return (
    <Alert variant="default" className="py-2 mb-2 bg-green-50">
      <AlertTitle className="text-xs flex items-center gap-1">
        <Bug className="h-3 w-3" /> Messages Tab Loaded Successfully
      </AlertTitle>
      <AlertDescription className="text-xs">
        Direct Messages tab appears to be functioning correctly. No navigation issues detected.
      </AlertDescription>
    </Alert>
  );
}
