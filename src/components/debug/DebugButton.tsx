
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { useDebugContext } from './DebugProvider';

interface DebugButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void; // Add the onClick prop
}

export function DebugButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  onClick
}: DebugButtonProps) {
  const { toggleDebugPanel, showDebugPanel } = useDebugContext();

  // Handle click event, combining the toggleDebugPanel and any custom onClick
  const handleClick = () => {
    toggleDebugPanel();
    if (onClick) onClick();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      title="Toggle Debug Panel (Ctrl+Shift+D)"
    >
      <Bug className="h-4 w-4 mr-2" />
      {showDebugPanel ? 'Hide Debug' : 'Debug'}
    </Button>
  );
}
