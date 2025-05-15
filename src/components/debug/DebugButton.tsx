
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Bug } from 'lucide-react';

export interface DebugButtonProps extends ButtonProps {
  onClick?: () => void;
}

export function DebugButton({ onClick, ...props }: DebugButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      {...props}
    >
      <Bug className="h-3 w-3 mr-1" />
      Debug
    </Button>
  );
}
