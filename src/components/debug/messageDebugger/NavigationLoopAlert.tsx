
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

interface NavigationLoopAlertProps {
  loopDetected: boolean;
}

export function NavigationLoopAlert({ loopDetected }: NavigationLoopAlertProps) {
  const debug = useDebug('NavigationLoopAlert');

  if (!loopDetected) return null;

  return (
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
  );
}
