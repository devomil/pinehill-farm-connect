
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NavigationWarningProps {
  hasLoopDetected: boolean;
  attemptRecovery: () => void;
}

export const NavigationWarning: React.FC<NavigationWarningProps> = ({
  hasLoopDetected,
  attemptRecovery
}) => {
  const navigate = useNavigate();
  
  if (!hasLoopDetected) {
    return null;
  }

  // Function to perform a thorough recovery
  const performThoroughRecovery = () => {
    // Clear any lingering state first
    window.sessionStorage.removeItem('communication_recovery');
    localStorage.removeItem('last_communication_tab');
    
    // Set fresh recovery flag
    window.sessionStorage.setItem('communication_recovery', 'true');
    
    // Generate a unique recovery URL with timestamp
    const timestamp = Date.now();
    
    // Show toast for user feedback
    toast.success("Starting navigation recovery...");
    
    // First navigate to announcements tab with recovery enabled
    navigate(`/communication?tab=announcements&recovery=true&ts=${timestamp}`, { replace: true });
    
    // After a delay, we'll try to navigate back to messages tab
    setTimeout(() => {
      const messagesRecoveryUrl = `/communication?tab=messages&recovery=true&ts=${timestamp + 500}`;
      navigate(messagesRecoveryUrl, { replace: true });
      toast.success("Completed navigation reset");
    }, 1000);
  };

  // Handle simple recovery 
  const handleQuickRecovery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    attemptRecovery();
    toast.success("Fixing navigation...");
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Navigation Issue Detected</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          There's an issue with the Direct Messages tab navigation. The system will try to
          automatically stabilize the interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={handleQuickRecovery}
            size="sm" 
            variant="outline" 
            className="bg-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Quick Fix
          </Button>
          <Button
            onClick={performThoroughRecovery}
            size="sm"
            variant="default"
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Full Recovery
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
