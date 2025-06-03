
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';
import { MessageDebuggerProps } from './messageDebugger/types';
import { IssuesDiagnostics } from './messageDebugger/IssuesDiagnostics';
import { NavigationLoopAlert } from './messageDebugger/NavigationLoopAlert';
import { SuccessAlert } from './messageDebugger/SuccessAlert';
import { StatusBadges } from './messageDebugger/StatusBadges';
import { DebugAccordion } from './messageDebugger/DebugAccordion';
import { DetailedDiagnostics } from './messageDebugger/DetailedDiagnostics';
import { DebugActions } from './messageDebugger/DebugActions';

export function MessageDebugger({
  selectedEmployee,
  messages,
  filteredMessages,
  currentUser,
  isLoading,
  navigationState,
  error
}: MessageDebuggerProps) {
  const [expanded, setExpanded] = useState(false);
  const debug = useDebug('MessageDebugger', { trackRenders: true });
  const [autoExpanded, setAutoExpanded] = useState(false);
  
  // Auto-expand when navigation issues are detected or on first view
  useEffect(() => {
    // Auto-expand when navigation issues are detected
    if ((navigationState?.loopDetected || error) && !expanded && !autoExpanded) {
      setExpanded(true);
      setAutoExpanded(true);
      debug.info('Automatically expanded debugger due to navigation issue or error');
    }
    
    // Auto-expand on messages tab to make it more visible
    if (navigationState?.activeTab === 'messages' && !expanded && !autoExpanded) {
      setExpanded(true);
      setAutoExpanded(true);
      debug.info('Automatically expanded debugger on messages tab');
    }
  }, [navigationState?.loopDetected, navigationState?.activeTab, error, expanded, autoExpanded, debug]);
  
  if (!expanded) {
    return (
      <Button 
        variant={navigationState?.loopDetected || error ? "destructive" : navigationState?.activeTab === 'messages' ? "default" : "ghost"}
        size="sm"
        onClick={() => setExpanded(true)}
        className="text-xs flex gap-1 items-center mb-2"
      >
        {navigationState?.loopDetected || error ? <AlertCircle className="h-3 w-3" /> : <Bug className="h-3 w-3" />}
        {navigationState?.loopDetected ? "Navigation Issue Detected - Click to Debug" : 
         error ? "Error Detected - Click to Debug" :
         navigationState?.activeTab === 'messages' ? "View Message Diagnostics" : "Show Message Debugger"}
      </Button>
    );
  }
  
  // Calculate some diagnostics
  const messageCount = messages?.length || 0;
  const filteredCount = filteredMessages?.length || 0;
  const hasSelectedEmployee = selectedEmployee !== null;
  const hasCurrentUser = currentUser !== null;
  
  // Determine if there are any issues for alerts
  const hasIssues = !hasCurrentUser || 
    (messageCount === 0 && !isLoading) || 
    (hasSelectedEmployee && filteredCount === 0 && !isLoading) || 
    error || 
    (navigationState?.navigationInProgress && !navigationState?.navigationComplete) ||
    navigationState?.loopDetected ||
    (navigationState?.tabSwitchCount && navigationState.tabSwitchCount > 3);
  
  return (
    <Card className="mb-4 mt-2 border-dashed border-yellow-500/50 bg-yellow-50/10">
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{navigationState?.loopDetected ? "⚠️ Navigation Issue Detected" : 
                error ? "⚠️ Debug Information (Error Detected)" :
                navigationState?.activeTab === 'messages' ? "Direct Messages Diagnostics" : 
                "Messages Debug Information"}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-2 text-xs">
        <IssuesDiagnostics
          currentUser={currentUser}
          messageCount={messageCount}
          filteredCount={filteredCount}
          isLoading={isLoading}
          hasSelectedEmployee={hasSelectedEmployee}
          error={error}
          navigationState={navigationState}
        />
        
        <SuccessAlert 
          activeTab={navigationState?.activeTab || ''} 
          hasIssues={hasIssues}
        />
        
        <NavigationLoopAlert 
          loopDetected={navigationState?.loopDetected || false}
        />
        
        <StatusBadges
          hasCurrentUser={hasCurrentUser}
          hasSelectedEmployee={hasSelectedEmployee}
          messageCount={messageCount}
          filteredCount={filteredCount}
          isLoading={isLoading}
          error={error}
          navigationState={navigationState}
        />
        
        <DebugAccordion
          messages={messages}
          selectedEmployee={selectedEmployee}
          error={error}
          navigationState={navigationState}
        />
        
        <DetailedDiagnostics
          navigationState={navigationState}
          messageCount={messageCount}
          isLoading={isLoading}
        />
        
        <DebugActions />
      </CardContent>
    </Card>
  );
}
