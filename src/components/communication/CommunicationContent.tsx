
import React, { useEffect, useState } from "react";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { User } from "@/types";
import { toast } from "sonner";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";

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
  
  // Reset error state when tab changes
  useEffect(() => {
    if (errorState && errorState.tab !== activeTab) {
      console.log("Resetting error state on tab change");
      setErrorState(null);
    }
  }, [activeTab, errorState]);
  
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
  
  // Only render the component for the active tab to avoid unnecessary data fetching
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
          <EmployeeCommunications />
        </React.Suspense>
      )}
    </>
  );
});

CommunicationContent.displayName = "CommunicationContent";
