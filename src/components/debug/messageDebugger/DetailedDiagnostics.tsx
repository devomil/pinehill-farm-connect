
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';
import { NavigationState } from './types';

interface DetailedDiagnosticsProps {
  navigationState?: NavigationState;
  messageCount: number;
  isLoading: boolean;
}

export function DetailedDiagnostics({ navigationState, messageCount, isLoading }: DetailedDiagnosticsProps) {
  const debug = useDebug('DetailedDiagnostics');

  if (navigationState?.loopDetected) {
    return (
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
    );
  }

  if (navigationState?.activeTab === 'messages' && !navigationState?.loopDetected) {
    return (
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
    );
  }

  return null;
}
