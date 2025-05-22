
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    
    // Show recovery feedback
    toast.loading("Starting navigation recovery...", { id: "recovery-toast" });
    
    // Execute recovery function from parent
    onRecover();
    
    // Always force navigation to announcements tab first to reset UI state
    navigate('/communication?tab=announcements&recovery=true', { replace: true });
    
    // After a short delay, allow navigation back to messages tab with recovery mode
    setTimeout(() => {
      // Force the active tab in the URL
      const messagesRecoveryUrl = `/communication?tab=messages&recovery=true&ts=${timestamp}`;
      navigate(messagesRecoveryUrl, { replace: true });
      
      // After a bit more delay, update the toast
      setTimeout(() => {
        toast.success("Navigation recovery complete", { id: "recovery-toast" });
      }, 300);
    }, 1500); // Increased delay for stability
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
              <RefreshCw className="h-3 w-3" />
            )}
            {loopDetected ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> 
                Fix Navigation Loop
              </>
            ) : (
              'Reset Navigation'
            )}
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
