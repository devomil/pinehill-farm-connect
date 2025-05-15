
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDebug } from '@/hooks/useDebug';
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';
import { AlertCircle, Bug, RefreshCw } from 'lucide-react';

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
    loopDetected?: boolean;
    tabSwitchCount?: number;
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
        
        {navigationState?.activeTab === 'messages' && !issues.length && (
          <Alert variant="default" className="py-2 mb-2 bg-green-50">
            <AlertTitle className="text-xs flex items-center gap-1">
              <Bug className="h-3 w-3" /> Messages Tab Loaded Successfully
            </AlertTitle>
            <AlertDescription className="text-xs">
              Direct Messages tab appears to be functioning correctly. No navigation issues detected.
            </AlertDescription>
          </Alert>
        )}
        
        {navigationState?.loopDetected && (
          <Alert variant="destructive" className="py-2 mb-2">
            <AlertTitle className="text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Navigation Loop Detected
            </AlertTitle>
            <AlertDescription className="text-xs space-y-1">
              <p>The app is rapidly switching between tabs, preventing you from staying on the messages tab.</p>
              <ol className="list-decimal pl-4 mt-1">
                <li>Try using the "Fix Navigation Loop" button</li>
                <li>Manually add "?recovery=true" to the URL</li>
                <li>Clear browser cache and reload</li>
              </ol>
              <div className="mt-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    debug.info('Manual recovery requested', { timestamp: new Date().toISOString() });
                    window.location.href = '/communication?tab=messages&recovery=true';
                  }}
                >
                  Attempt Recovery
                </Button>
              </div>
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
            <AccordionItem value="navigation-state" defaultValue="navigation-state">
              <AccordionTrigger className="text-xs py-1">Navigation State</AccordionTrigger>
              <AccordionContent>
                <pre className="text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-32">
                  {JSON.stringify(navigationState, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="url-breakdown">
            <AccordionTrigger className="text-xs py-1">URL Analysis</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <div>
                  <strong>Current Path:</strong> {window.location.pathname}
                </div>
                <div>
                  <strong>Search Params:</strong> {window.location.search || "(none)"}
                </div>
                <div>
                  <strong>Tab Parameter:</strong> {new URLSearchParams(window.location.search).get('tab') || "(none)"}
                </div>
                <div>
                  <strong>Recovery Mode:</strong> {new URLSearchParams(window.location.search).get('recovery') === 'true' ? "Yes" : "No"}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="possible-solutions">
            <AccordionTrigger className="text-xs py-1">Troubleshooting Steps</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <p className="font-medium">If you're getting kicked out of messages tab:</p>
                <ol className="list-decimal pl-4">
                  <li>Use the "Fix Navigation Loop" button in the navigation bar</li>
                  <li>Try adding "?recovery=true" to your URL</li>
                  <li>Clear localStorage and browser cache</li>
                  <li>Try a different browser</li>
                  <li>Check console for specific errors</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {navigationState && navigationState.loopDetected && (
          <div className="border-t pt-2 mt-2 bg-destructive/10 p-2 rounded">
            <div className="text-xs font-medium mb-2 text-destructive">Navigation Loop Detailed Diagnostics</div>
            <p className="text-[10px] mb-2">
              A navigation loop has been detected, which is preventing you from staying on the messages tab.
              This may be caused by rapid state changes, URL parameter conflicts, or error recovery logic.
            </p>
            <div className="space-y-1 mb-2">
              <div><strong>URL:</strong> {window.location.href}</div>
              <div><strong>Tab parameter:</strong> {new URLSearchParams(window.location.search).get('tab') || "(none)"}</div>
              <div><strong>Tab switches:</strong> {navigationState.tabSwitchCount || 0}</div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="text-xs h-7 w-full flex items-center gap-1"
              onClick={() => {
                debug.log('Navigation recovery requested', { timestamp: new Date().toISOString() });
                window.location.href = '/communication?tab=messages&recovery=true';
              }}
            >
              <RefreshCw className="h-3 w-3" /> Perform Full Recovery
            </Button>
          </div>
        )}
        
        {navigationState?.activeTab === 'messages' && !navigationState?.loopDetected && (
          <div className="border-t pt-2 mt-2 bg-blue-50/50 p-2 rounded">
            <div className="text-xs font-medium mb-2">Direct Messages Status</div>
            <p className="text-[10px] mb-2">
              You are currently viewing the Direct Messages tab. This diagnostic panel shows information about
              the current state of messages and navigation.
            </p>
            <div className="space-y-1 mb-2">
              <div><strong>URL:</strong> {window.location.href}</div>
              <div><strong>Tab parameter:</strong> {new URLSearchParams(window.location.search).get('tab') || "(none)"}</div>
              {navigationState?.tabSwitchCount && (
                <div><strong>Tab switches:</strong> {navigationState.tabSwitchCount}</div>
              )}
              <div><strong>Message count:</strong> {messageCount}</div>
              <div><strong>Loading state:</strong> {isLoading ? "Loading" : "Complete"}</div>
            </div>
          </div>
        )}
        
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
              <RefreshCw className="h-3 w-3 mr-1" /> Force Refresh
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
              variant="destructive" 
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                debug.log('Recovery mode requested', { timestamp: new Date().toISOString() });
                window.location.href = '/communication?tab=messages&recovery=true';
              }}
            >
              Enter Recovery Mode
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
