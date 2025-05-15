
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface NavigationRecoveryButtonProps {
  onRecover: () => void;
}

export function NavigationRecoveryButton({ onRecover }: NavigationRecoveryButtonProps) {
  return (
    <Button 
      variant="destructive"
      size="sm" 
      onClick={onRecover}
      className="flex items-center gap-1 text-xs animate-pulse"
    >
      <AlertCircle className="h-3 w-3" />
      Fix Navigation Loop
    </Button>
  );
}
