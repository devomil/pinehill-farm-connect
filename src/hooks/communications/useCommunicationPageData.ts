
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunications } from "@/hooks/useCommunications";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";
import { toast } from "sonner";

export function useCommunicationPageData() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("");
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const { unreadMessages, refreshMessages } = useCommunications();
  const { unfilteredEmployees } = useEmployeeDirectory();
  const navigationComplete = useRef<boolean>(true);
  const isRefreshing = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(Date.now());
  const initialTabSet = useRef<boolean>(false);
  const { stats, refetch: refreshAnnouncementStats } = useAnnouncementStats();
  
  // Check if user is admin for permissions
  const isAdmin = currentUser?.role === 'admin' || false;
  
  // Set initial tab based on URL or default to announcements - with guards against loops
  useEffect(() => {
    // Skip if we've already set the initial tab to avoid loops
    if (initialTabSet.current) {
      return;
    }
    
    // Get tab from URL query params
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    // Set default tab if none is specified, but don't trigger navigation
    const initialTab = tabParam === 'messages' ? 'messages' : 'announcements';
    console.log(`Initial tab set to ${initialTab} based on URL: ${location.search}`);
    
    setActiveTab(initialTab);
    initialTabSet.current = true;
    
    // Force a message refresh when opening the messages tab
    if (initialTab === 'messages') {
      console.log('Initial tab is messages, refreshing message data');
      // Show loading indicator
      const loadingToast = toast.loading("Loading messages...");
      
      setTimeout(() => {
        refreshMessages()
          .then(() => {
            toast.success("Messages loaded", { id: loadingToast });
          })
          .catch(err => {
            console.error("Error during initial messages load:", err);
            toast.error("Failed to load messages", { id: loadingToast });
          });
      }, 300); // Small delay to ensure component is mounted
    }
  }, [location.search, refreshMessages]);

  // Handle announcement creation (for admin users)
  const handleAnnouncementCreate = async () => {
    console.log("Creating new announcement");
    // Just refresh data after creation
    await refreshAnnouncementStats();
  };
  
  // Manual refresh handler with improved error handling
  const handleManualRefresh = useCallback(async () => {
    console.log("Manual refresh triggered");
    
    // Prevent multiple refreshes in quick succession
    if (isRefreshing.current) {
      console.log("Refresh already in progress, skipping");
      toast.info("Refresh already in progress");
      return;
    }
    
    isRefreshing.current = true;
    const loadingToast = toast.loading("Refreshing data...");
    
    try {
      // Refresh messages first to update unread count badges
      await refreshMessages();
      
      // Then refresh announcements stats if needed
      if (activeTab === 'announcements' && isAdmin) {
        await refreshAnnouncementStats();
      }
      
      lastRefreshTime.current = Date.now();
      toast.success("Data refreshed successfully", { id: loadingToast });
    } catch (err) {
      console.error("Error during manual refresh:", err);
      toast.error("Error refreshing data. Please try again.", { id: loadingToast });
    } finally {
      isRefreshing.current = false;
    }
  }, [activeTab, isAdmin, refreshMessages, refreshAnnouncementStats]);

  return {
    currentUser,
    showDebugInfo,
    setShowDebugInfo,
    activeTab,
    setActiveTab,
    unreadMessages,
    unfilteredEmployees,
    isAdmin,
    handleAnnouncementCreate,
    handleManualRefresh,
    location,
    navigationComplete,
    isRefreshing,
    lastRefreshTime,
    refreshMessages
  };
}
