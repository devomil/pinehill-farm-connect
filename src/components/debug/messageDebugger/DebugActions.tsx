
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

export function DebugActions() {
  const debug = useDebug('DebugActions');

  return (
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
  );
}
