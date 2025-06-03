
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { NavigationState } from './types';

interface StatusBadgesProps {
  hasCurrentUser: boolean;
  hasSelectedEmployee: boolean;
  messageCount: number;
  filteredCount: number;
  isLoading: boolean;
  error?: any;
  navigationState?: NavigationState;
}

export function StatusBadges({
  hasCurrentUser,
  hasSelectedEmployee,
  messageCount,
  filteredCount,
  isLoading,
  error,
  navigationState
}: StatusBadgesProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant={hasCurrentUser ? "outline" : "destructive"}>
        Current User: {hasCurrentUser ? 'Yes' : 'No'}
      </Badge>
      
      <Badge variant={hasSelectedEmployee ? "outline" : "secondary"}>
        Selected Employee: {hasSelectedEmployee ? 'Yes' : 'No'}
      </Badge>
      
      <Badge variant="outline">
        Messages: {messageCount}
      </Badge>
      
      <Badge variant="outline">
        Filtered: {filteredCount}
      </Badge>
      
      <Badge variant={isLoading ? "default" : "outline"}>
        Loading: {isLoading ? 'Yes' : 'No'}
      </Badge>
      
      <Badge variant={error ? "destructive" : "outline"}>
        Error: {error ? 'Yes' : 'No'}
      </Badge>
      
      {navigationState && (
        <Badge variant={navigationState.navigationInProgress ? "secondary" : "outline"}>
          Navigation: {navigationState.navigationInProgress ? 'In Progress' : 'Complete'}
        </Badge>
      )}

      {navigationState?.loopDetected && (
        <Badge variant="destructive">
          Loop Detected
        </Badge>
      )}
      
      {navigationState?.activeTab === 'messages' && (
        <Badge variant="secondary">
          Active Tab: Messages
        </Badge>
      )}
    </div>
  );
}
