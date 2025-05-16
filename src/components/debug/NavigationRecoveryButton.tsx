
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface NavigationRecoveryButtonProps {
  onRecover: () => void;
  loopDetected?: boolean;
}

export function NavigationRecoveryButton({ onRecover, loopDetected = false }: NavigationRecoveryButtonProps) {
  const navigate = useNavigate();

  // Function to perform a thorough navigation recovery
  const performFullRecovery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear all navigation state
    window.sessionStorage.removeItem('communication_recovery');
    localStorage.removeItem('last_communication_tab');
    
    // Set fresh recovery flag
    window.sessionStorage.setItem('communication_recovery', 'true');
    
    // Add current timestamp to avoid caching issues
    const timestamp = Date.now();
    
    // Execute recovery function
    onRecover();
    
    // If there's a detected loop, perform a more thorough recovery
    if (loopDetected) {
      // First navigate to announcements tab to reset state
      navigate('/communication?tab=announcements&reset=true', { replace: true });
      
      // After a short delay, allow navigation back to messages tab with recovery mode
      setTimeout(() => {
        navigate(`/communication?tab=messages&recovery=true&ts=${timestamp}`, { replace: true });
      }, 500);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={loopDetected ? "destructive" : "outline"}
            size="sm" 
            onClick={performFullRecovery}
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
