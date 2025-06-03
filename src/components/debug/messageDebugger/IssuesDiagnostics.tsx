
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { User } from '@/types';
import { NavigationState } from './types';

interface IssuesDiagnosticsProps {
  currentUser: User | null;
  messageCount: number;
  filteredCount: number;
  isLoading: boolean;
  hasSelectedEmployee: boolean;
  error?: any;
  navigationState?: NavigationState;
}

export function IssuesDiagnostics({
  currentUser,
  messageCount,
  filteredCount,
  isLoading,
  hasSelectedEmployee,
  error,
  navigationState
}: IssuesDiagnosticsProps) {
  const hasCurrentUser = currentUser !== null;
  
  // Check for common issues
  const issues = [];
  
  if (!hasCurrentUser) {
    issues.push("Current user is null - authentication issue");
  }
  
  if (messageCount === 0 && !isLoading) {
    issues.push("No messages found - could be API or data fetching issue");
  }
  
  if (hasSelectedEmployee && filteredCount === 0 && !isLoading) {
    issues.push("No filtered messages for selected employee - check filtering logic");
  }
  
  if (error) {
    issues.push(`Error detected: ${error.message || JSON.stringify(error)}`);
  }
  
  // Check for navigation issues
  if (navigationState?.navigationInProgress && !navigationState?.navigationComplete) {
    issues.push("Navigation in progress but not complete - possible navigation loop");
  }
  
  if (navigationState?.loopDetected) {
    issues.push("Navigation loop detected - frequent tab changes occurring");
  }
  
  if (navigationState?.tabSwitchCount && navigationState.tabSwitchCount > 3) {
    issues.push(`Excessive tab switching (${navigationState.tabSwitchCount} changes) - may indicate UI instability`);
  }

  if (issues.length === 0) return null;

  return (
    <Alert variant="destructive" className="py-2">
      <AlertTitle className="text-xs">Potential Issues Detected</AlertTitle>
      <AlertDescription className="text-xs">
        <ul className="list-disc pl-4">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
