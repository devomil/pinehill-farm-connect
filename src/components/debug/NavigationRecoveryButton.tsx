
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
              
              // Set a flag in session storage to help with recovery
              window.sessionStorage.setItem('communication_recovery', 'true');
              
              // Add current timestamp to avoid caching issues
              const timestamp = Date.now();
              
              // Execute recovery function
              onRecover();
              
              // If loop detected, also add a recovery parameter to URL
              if (loopDetected) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('recovery', 'true');
                currentUrl.searchParams.set('ts', timestamp.toString());
                
                try {
                  // Use history.replaceState to avoid triggering navigation events
                  window.history.replaceState({}, '', currentUrl.toString());
                  
                  // After a short delay, force a clean reload if needed
                  setTimeout(() => {
                    if (document.location.pathname.includes('communication')) {
                      // Only reload if still on the communication page
                      window.location.reload();
                    }
                  }, 300);
                } catch (err) {
                  console.error('Failed to update history:', err);
                  // Fallback: direct navigation as a last resort
                  window.location.href = currentUrl.toString();
                }
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
