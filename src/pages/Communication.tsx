
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
  const hasSetDefaults = useRef(false);
  
  // State to track if we've attempted emergency recovery
  const [emergencyRecoveryNeeded, setEmergencyRecoveryNeeded] = useState(false);
  const emergencyRecoveryAttempted = useRef(false);
  
  // Check for stuck recovery state
  useEffect(() => {
    // If we're in recovery mode for more than 10 seconds, something might be wrong
    if (isRecoveryMode) {
      const recoveryTimeout = setTimeout(() => {
        // Only show the emergency recovery UI if we're still having issues
        if (navigationDebugger.hasLoopDetected && !emergencyRecoveryAttempted.current) {
          setEmergencyRecoveryNeeded(true);
        }
      }, 10000);
      
      return () => clearTimeout(recoveryTimeout);
    }
  }, [isRecoveryMode, navigationDebugger.hasLoopDetected]);
  
  // Create a log entry when the page mounts
  useEffect(() => {
    console.log(`Communication page mounted at ${new Date(mountTime.current).toISOString()}`);
    return () => {
      console.log(`Communication page unmounting after ${Date.now() - mountTime.current}ms`);
    };
  }, []);
  
  // Check for direct URL navigation issues and set default tab if needed
  useEffect(() => {
    if (hasSetDefaults.current) return;
    hasSetDefaults.current = true;
    
    // If no tab parameter is provided, default to announcements tab
    const urlParams = new URLSearchParams(location.search);
    if (!urlParams.has('tab')) {
      console.log("No tab parameter found, defaulting to announcements");
      // Use replace to avoid adding to history
      navigate('/communication?tab=announcements', { replace: true });
    }
    
    // Clean up any leftover recovery flags
    if (!isRecoveryMode) {
      window.sessionStorage.removeItem('message_tab_recovery_needed');
    }
    
    initialNavigationComplete.current = true;
  }, [location.search, navigate, isRecoveryMode]);

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
        description: "Navigation has been reset"
      });
      
      // Reset any flags that might be causing issues
      localStorage.removeItem('last_communication_tab');
      
      // If we're trying to recover the messages tab specifically
      if (currentTab === 'messages') {
        // Clear all message-related storage to ensure clean state
        window.sessionStorage.removeItem('message_tab_recovery_needed');
      }
    }
  }, [isRecoveryMode, stabilized, location.search, navigate]);
  
  // Handler for emergency recovery - most aggressive approach
  const handleEmergencyRecovery = () => {
    emergencyRecoveryAttempted.current = true;
    setEmergencyRecoveryNeeded(false);
    
    // Clear ALL localStorage and sessionStorage items that might be related
    Object.keys(localStorage).forEach(key => {
      if (key.includes('communication') || key.includes('tab') || key.includes('navigation')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(window.sessionStorage).forEach(key => {
      if (key.includes('communication') || key.includes('tab') || key.includes('recovery') || key.includes('navigation')) {
        window.sessionStorage.removeItem(key);
      }
    });
    
    // Force navigation to dashboard first to completely reset state
    toast.loading("Emergency navigation recovery in progress...");
    
    // First go to dashboard to reset all state
    navigate('/dashboard', { replace: true });
    
    // Then after a delay, go back to communication with a fresh start
    setTimeout(() => {
      navigate('/communication?tab=announcements&fresh=true', { replace: true });
      toast.success("Navigation completely reset", { 
        description: "Try accessing the Messages tab again"
      });
    }, 1500);
  };
  
  // Check if we're on messages tab
  const isOnMessagesTab = new URLSearchParams(location.search).get('tab') === 'messages';
  
  // Show recovery button if there's a loop detected or we're in recovery mode
  const showRecoveryButton = navigationDebugger.hasLoopDetected || isRecoveryMode;
  
  // Emergency recovery UI when we've tried everything else
  if (emergencyRecoveryNeeded) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto my-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Persistent Navigation Issue</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                We've detected a persistent navigation issue that standard recovery 
                couldn't fix. We need to perform an emergency navigation reset.
              </p>
              <p>This will:</p>
              <ul className="list-disc pl-6 my-2">
                <li>Clear all communication navigation state</li>
                <li>Reset the application to the dashboard</li>
                <li>Allow a fresh start to the communication page</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button 
                  onClick={handleEmergencyRecovery}
                  variant="destructive"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Perform Emergency Reset
                </Button>
                <Button 
                  onClick={() => setEmergencyRecoveryNeeded(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render a fallback UI if we're experiencing extreme navigation issues
  if (navigationDebugger.tabSwitchCount > 15 && !isRecoveryMode && isOnMessagesTab) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto my-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Navigation Loop Detected</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                We've detected a navigation issue that's preventing you from viewing the Messages tab.
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
                    localStorage.removeItem('last_communication_tab');
                    // Then set fresh recovery flag
                    window.sessionStorage.setItem('communication_recovery', 'true');
                    navigate(`/communication?tab=announcements&recovery=true&ts=${timestamp}`, { replace: true });
                    
                    // After a brief delay, try to navigate to messages again
                    setTimeout(() => {
                      navigate(`/communication?tab=messages&recovery=true&ts=${timestamp+1}`, { replace: true });
                    }, 2000);
                  }}
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Fix Navigation Issues
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
