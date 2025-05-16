
import React, { useEffect, useState, useRef } from "react";
import CommunicationPage from "@/components/communication/CommunicationPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NavigationRecoveryButton } from "@/components/debug/NavigationRecoveryButton";
import { useNavigationDebugger } from "@/hooks/communications/useNavigationDebugger";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Communication = () => {
  const navigationDebugger = useNavigationDebugger();
  const location = useLocation();
  const navigate = useNavigate();
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true';
  const [stabilized, setStabilized] = useState(false);
  const initialNavigationComplete = useRef(false);
  const mountTime = useRef(Date.now());
  
  // Create a log entry when the page mounts
  useEffect(() => {
    console.log(`Communication page mounted at ${new Date(mountTime.current).toISOString()}`);
    return () => {
      console.log(`Communication page unmounting after ${Date.now() - mountTime.current}ms`);
    };
  }, []);
  
  // Check for direct URL navigation issues
  useEffect(() => {
    if (initialNavigationComplete.current) return;
    
    // If no tab parameter is provided, default to announcements tab
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.has('tab')) {
      console.log("No tab parameter found, defaulting to announcements");
      // Use replace to avoid adding to history
      navigate('/communication?tab=announcements', { replace: true });
    }
    
    initialNavigationComplete.current = true;
  }, [location.search, navigate]);

  // Helper effect to ensure the recovery mode is properly initialized
  useEffect(() => {
    if (isRecoveryMode && !stabilized) {
      console.log("Entering recovery mode, stabilizing navigation");
      setStabilized(true);
      
      // Force a clean state when in recovery mode
      const cleanParams = new URLSearchParams(location.search);
      const currentTab = cleanParams.get('tab') || 'announcements'; // Default to announcements if no tab
      
      // Use a timestamp to avoid caching issues
      const timestamp = Date.now();
      cleanParams.set('tab', currentTab);
      cleanParams.set('recovery', 'true');
      cleanParams.set('ts', timestamp.toString());
      
      // Replace current navigation state to prevent history buildup
      navigate(`/communication?${cleanParams.toString()}`, { replace: true });
      
      // Show a toast to inform the user
      toast.success("Communication page stabilized", {
        description: "Navigation has been reset to prevent issues"
      });
    }
  }, [isRecoveryMode, stabilized, location.search, navigate]);
  
  // Check if we're on messages tab
  const isOnMessagesTab = new URLSearchParams(location.search).get('tab') === 'messages';
  
  // Show recovery button if there's a loop detected or we're in recovery mode
  const showRecoveryButton = navigationDebugger.hasLoopDetected || isRecoveryMode;
  
  // Render a fallback UI if we're experiencing extreme navigation issues
  if (navigationDebugger.tabSwitchCount > 10 && !isRecoveryMode && isOnMessagesTab) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto my-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Navigation Loop Detected</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                We've detected a severe navigation issue that's preventing you from viewing the Messages tab.
                Please try one of the recovery options below:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => navigate('/communication?tab=announcements', { replace: true })}
                  variant="outline"
                >
                  View Announcements Tab
                </Button>
                <Button 
                  onClick={() => {
                    const timestamp = Date.now();
                    // Clear any session storage flags that might be causing issues
                    window.sessionStorage.removeItem('communication_recovery');
                    // Then set fresh recovery flag
                    window.sessionStorage.setItem('communication_recovery', 'true');
                    navigate(`/communication?tab=messages&recovery=true&ts=${timestamp}`, { replace: true });
                  }}
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Enable Recovery Mode
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      extraHeaderControls={
        showRecoveryButton ? (
          <NavigationRecoveryButton 
            onRecover={navigationDebugger.attemptRecovery} 
            loopDetected={navigationDebugger.hasLoopDetected}
          />
        ) : null
      }
    >
      <CommunicationPage />
    </DashboardLayout>
  );
};

export default Communication;
