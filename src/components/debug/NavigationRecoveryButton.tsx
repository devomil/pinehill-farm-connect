
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationRecoveryButtonProps {
  onRecover: () => void;
  loopDetected?: boolean;
}

export function NavigationRecoveryButton({ onRecover, loopDetected = false }: NavigationRecoveryButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={loopDetected ? "destructive" : "outline"}
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Add current timestamp to avoid caching issues
              const timestamp = Date.now();
              
              onRecover();
              
              // If loop detected, also add a recovery parameter to URL
              if (loopDetected) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('recovery', 'true');
                currentUrl.searchParams.set('ts', timestamp.toString());
                window.history.replaceState({}, '', currentUrl.toString());
              }
            }}
            className={`flex items-center gap-1 text-xs ${loopDetected ? 'animate-pulse' : ''}`}
          >
            {loopDetected ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Bug className="h-3 w-3" />
            )}
            {loopDetected ? 'Fix Navigation Loop' : 'Reset Navigation'}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {loopDetected 
            ? "Click to fix navigation loop issue in the Messages tab"
            : "Reset navigation state to resolve any navigation issues"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
