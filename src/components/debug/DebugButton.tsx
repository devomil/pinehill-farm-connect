
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { useDebugContext } from './DebugProvider';

interface DebugButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DebugButton({
  variant = 'outline',
  size = 'sm',
  className = '',
}: DebugButtonProps) {
  const { toggleDebugPanel, showDebugPanel } = useDebugContext();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDebugPanel}
      className={className}
      title="Toggle Debug Panel (Ctrl+Shift+D)"
    >
      <Bug className="h-4 w-4 mr-2" />
      {showDebugPanel ? 'Hide Debug' : 'Debug'}
    </Button>
  );
}
