
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

// Use React.memo to prevent unnecessary re-renders when props don't change
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
  
  // Increment render count for debugging
  renderCountRef.current++;
  
  // Check if we're in recovery mode - in this case we need special handling
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true';
  
  // Log mount and unmount events
  useEffect(() => {
    console.log(`CommunicationContent mounted, activeTab: ${activeTab}, isRecoveryMode: ${isRecoveryMode}, renderCount: ${renderCountRef.current}`);
    
    // When mounted, mark as stable after a short delay
    const stabilizeTimer = setTimeout(() => {
      stableContentRef.current = true;
      console.log("Content component stabilized");
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
  
  // Show warning if navigation loop is detected
  if (navigationDebugger.hasLoopDetected && activeTab === 'messages') {
    return (
      <div className="space-y-4">
        <NavigationWarning 
          hasLoopDetected={navigationDebugger.hasLoopDetected}
          attemptRecovery={navigationDebugger.attemptRecovery}
        />
        
        {/* Render the actual content after the warning */}
        {renderTabContent()}
      </div>
    );
  }
  
  return renderTabContent();
  
  // Helper function to render the appropriate tab content
  function renderTabContent() {
    // IMPORTANT: Always render both components in recovery mode, but hide the inactive one
    // This prevents unmounting which can cause the navigation loop
    if (isRecoveryMode || navigationDebugger.hasLoopDetected) {
      return (
        <div>
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
    
    // Regular render mode - only render the active component
    return (
      <>
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
  }
});

CommunicationContent.displayName = "CommunicationContent";
