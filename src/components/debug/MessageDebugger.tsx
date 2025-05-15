
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebug } from '@/hooks/useDebug';
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';

interface MessageDebuggerProps {
  selectedEmployee: User | null;
  messages: Communication[];
  filteredMessages: Communication[];
  currentUser: User | null;
  isLoading: boolean;
  navigationState?: {
    activeTab?: string;
    navigationInProgress?: boolean;
    navigationComplete?: boolean;
  };
  error?: any;
}

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
  
  if (!expanded) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setExpanded(true)}
        className="text-xs"
      >
        Show Message Debugger
      </Button>
    );
  }
  
  // Calculate some diagnostics
  const messageCount = messages?.length || 0;
  const filteredCount = filteredMessages?.length || 0;
  const hasSelectedEmployee = selectedEmployee !== null;
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
  
  if (navigationState?.navigationInProgress && !navigationState?.navigationComplete) {
    issues.push("Navigation in progress but not complete - possible navigation loop");
  }
  
  return (
    <Card className="mb-4 mt-2 border-dashed border-yellow-500/50 bg-yellow-50/10">
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Messages Debug Information</span>
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
        {issues.length > 0 && (
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
        )}
        
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
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="messages-data">
            <AccordionTrigger className="text-xs py-1">Messages Data Sample</AccordionTrigger>
            <AccordionContent>
              <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
                {messages && messages.length > 0 
                  ? JSON.stringify(messages.slice(0, 2), null, 2) 
                  : 'No messages available'}
              </pre>
            </AccordionContent>
          </AccordionItem>
          
          {selectedEmployee && (
            <AccordionItem value="selected-employee">
              <AccordionTrigger className="text-xs py-1">Selected Employee</AccordionTrigger>
              <AccordionContent>
                <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
                  {JSON.stringify(selectedEmployee, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {error && (
            <AccordionItem value="error-details">
              <AccordionTrigger className="text-xs py-1 text-destructive">Error Details</AccordionTrigger>
              <AccordionContent>
                <pre className="text-[10px] bg-destructive/10 p-2 rounded overflow-x-auto max-h-32 text-destructive">
                  {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {navigationState && (
            <AccordionItem value="navigation-state">
              <AccordionTrigger className="text-xs py-1">Navigation State</AccordionTrigger>
              <AccordionContent>
                <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
                  {JSON.stringify(navigationState, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        {/* Debug actions section */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium mb-2">Debug Actions</div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                debug.log('Manual message refresh requested', { timestamp: new Date().toISOString() });
                window.location.reload();
              }}
            >
              Force Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                debug.log('Navigation reset requested', { timestamp: new Date().toISOString() });
                window.location.href = '/communication?tab=messages&reset=true';
              }}
            >
              Reset Navigation
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                debug.log('Clear localStorage requested', { timestamp: new Date().toISOString() });
                if (window.confirm('This will clear all saved debug settings. Continue?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              Clear Storage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
