
import React, { useEffect, useState, useRef } from "react";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { User } from "@/types";
import { toast } from "sonner";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";
import { useLocation } from "react-router-dom";
import { NavigationWarning } from "./NavigationWarning";
import { useNavigationDebugger } from "@/hooks/communications/useNavigationDebugger";

interface CommunicationContentProps {
  activeTab: string;
  currentUser: User | null;
  unfilteredEmployees: User[];
  isAdmin: boolean;
}

export const CommunicationContent = React.memo<CommunicationContentProps>(({
  activeTab,
  currentUser,
  unfilteredEmployees,
  isAdmin
}) => {
  const [errorState, setErrorState] = useState<{tab: string, count: number} | null>(null);
  const refreshMessages = useRefreshMessages();
  const location = useLocation();
  const navigationDebugger = useNavigationDebugger();
  const mountRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const stableContentRef = useRef(false);
  const [stableComponentMounted, setStableComponentMounted] = useState(false);
  
  // Increment render count for debugging
  renderCountRef.current++;
  
  // Check if we're in recovery mode - in this case we need special handling
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true' ||
                        window.sessionStorage.getItem('communication_recovery') === 'true';
  
  // Log mount and unmount events
  useEffect(() => {
    console.log(`CommunicationContent mounted, activeTab: ${activeTab}, isRecoveryMode: ${isRecoveryMode}, renderCount: ${renderCountRef.current}`);
    
    // When mounted, mark as stable after a short delay
    const stabilizeTimer = setTimeout(() => {
      stableContentRef.current = true;
      setStableComponentMounted(true);
      console.log("Content component stabilized");
      
      // Clear recovery flag from session storage after successful mount
      if (isRecoveryMode && activeTab === 'messages') {
        setTimeout(() => {
          if (document.location.pathname.includes('communication')) {
            window.sessionStorage.removeItem('communication_recovery');
            console.log("Recovery flag cleared from session storage");
          }
        }, 1000);
      }
    }, 500);
    
    return () => {
      console.log(`CommunicationContent unmounting, activeTab was: ${activeTab}, isRecoveryMode: ${isRecoveryMode}, lived for: ${Date.now() - mountRef.current}ms`);
      clearTimeout(stabilizeTimer);
    };
  }, [activeTab, isRecoveryMode]);
  
  // Reset error state when tab changes
  useEffect(() => {
    if (errorState && errorState.tab !== activeTab) {
      console.log("Resetting error state on tab change");
      setErrorState(null);
    }
  }, [activeTab, errorState]);
  
  // Add stabilization effect for recovery mode - CRITICAL part
  useEffect(() => {
    if (isRecoveryMode && activeTab === 'messages') {
      // In recovery mode, we need to ensure the component stays mounted
      console.log("Running in messages recovery mode - stabilizing component");
      
      // Force a data refresh when in recovery mode
      const timer = setTimeout(() => {
        refreshMessages();
        
        // After refresh, show success toast
        toast.success("Messages tab stabilized", {
          description: "You can now use the messages tab normally"
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isRecoveryMode, activeTab, refreshMessages]);
  
  // Error handler for tab components
  const handleTabError = (tab: string, error: Error) => {
    console.error(`Error in ${tab} tab:`, error);
    
    setErrorState(prev => {
      const newCount = (prev?.tab === tab ? prev.count + 1 : 1);
      
      // Show error toast only on first few errors
      if (newCount <= 3) {
        toast.error(`Error in ${tab} tab: ${error.message}`, {
          description: "The application will try to recover automatically."
        });
      }
      
      // If too many errors in succession, try to recover by refreshing data
      if (newCount === 5) {
        console.log("Too many errors, forcing data refresh");
        refreshMessages();
      }
      
      return { tab, count: newCount };
    });
  };
  
  // Determine if warning should be shown
  const showNavigationWarning = navigationDebugger.hasLoopDetected && activeTab === 'messages';
  
  // Special case for new 'both' rendering mode that prevents unmounting of components
  // THIS IS THE KEY CHANGE: Always render both components, but only show the active one
  // This prevents the unmounting/remounting cycle that causes the navigation loop
  if (isRecoveryMode || navigationDebugger.hasLoopDetected || stableComponentMounted) {
    return (
      <div className="space-y-4">
        {showNavigationWarning && (
          <NavigationWarning 
            hasLoopDetected={navigationDebugger.hasLoopDetected}
            attemptRecovery={navigationDebugger.attemptRecovery}
          />
        )}
        
        {/* Render both components but only show the active one */}
        <div className={activeTab === "announcements" ? "block" : "hidden"}>
          <AnnouncementManager 
            currentUser={currentUser}
            allEmployees={unfilteredEmployees || []}
            isAdmin={isAdmin}
          />
        </div>
        
        <div className={activeTab === "messages" ? "block" : "hidden"}>
          <React.Suspense fallback={<div className="p-4 text-center">Loading messages...</div>}>
            <EmployeeCommunications 
              retryCount={errorState?.tab === "messages" ? errorState.count : 0} 
            />
          </React.Suspense>
        </div>
      </div>
    );
  }
  
  // Regular rendering mode
  return (
    <>
      {showNavigationWarning && (
        <NavigationWarning 
          hasLoopDetected={navigationDebugger.hasLoopDetected}
          attemptRecovery={navigationDebugger.attemptRecovery}
        />
      )}
      
      {activeTab === "announcements" && (
        <AnnouncementManager 
          currentUser={currentUser}
          allEmployees={unfilteredEmployees || []}
          isAdmin={isAdmin}
        />
      )}
      
      {activeTab === "messages" && (
        <React.Suspense fallback={<div className="p-4 text-center">Loading messages...</div>}>
          <EmployeeCommunications 
            retryCount={errorState?.tab === "messages" ? errorState.count : 0} 
          />
        </React.Suspense>
      )}
    </>
  );
});

CommunicationContent.displayName = "CommunicationContent";
