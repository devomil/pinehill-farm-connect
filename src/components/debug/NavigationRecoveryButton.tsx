
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug } from 'lucide-react';

interface NavigationRecoveryButtonProps {
  onRecover: () => void;
  loopDetected?: boolean;
}

export function NavigationRecoveryButton({ onRecover, loopDetected = false }: NavigationRecoveryButtonProps) {
  return (
    <Button 
      variant="destructive"
      size="sm" 
      onClick={onRecover}
      className={`flex items-center gap-1 text-xs ${loopDetected ? 'animate-pulse' : ''}`}
      title={loopDetected ? "Fix navigation loop detected in Messages tab" : "Reset navigation state"}
    >
      {loopDetected ? (
        <AlertCircle className="h-3 w-3" />
      ) : (
        <Bug className="h-3 w-3" />
      )}
      {loopDetected ? 'Fix Navigation Loop' : 'Reset Navigation'}
    </Button>
  );
}
