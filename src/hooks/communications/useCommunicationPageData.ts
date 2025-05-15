
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunications } from "@/hooks/useCommunications";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAnnouncementStats } from "@/hooks/announcement/useAnnouncementStats";

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
  const { stats, refetch: refreshAnnouncementStats } = useAnnouncementStats();
  
  // Check if user is admin for permissions
  const isAdmin = currentUser?.role === 'admin' || false;
  
  // Set initial tab based on URL or default to announcements
  useEffect(() => {
    // Get tab from URL query params
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    // Set default tab if none is specified, but don't trigger navigation
    const initialTab = tabParam === 'messages' ? 'messages' : 'announcements';
    console.log(`Initial tab set to ${initialTab} based on URL: ${location.search}`);
    
    setActiveTab(initialTab);
  }, []);

  // Handle announcement creation (for admin users)
  const handleAnnouncementCreate = async () => {
    console.log("Creating new announcement");
    // Just refresh data after creation
    await refreshAnnouncementStats();
  };
  
  // Manual refresh handler for debug purposes
  const handleManualRefresh = async () => {
    console.log("Manual refresh triggered");
    
    // Prevent multiple refreshes in quick succession
    if (isRefreshing.current) {
      console.log("Refresh already in progress, skipping");
      return;
    }
    
    isRefreshing.current = true;
    
    try {
      // Refresh messages first to update unread count badges
      await refreshMessages();
      
      // Then refresh announcements stats if needed
      if (activeTab === 'announcements' && isAdmin) {
        await refreshAnnouncementStats();
      }
      
      lastRefreshTime.current = Date.now();
    } catch (err) {
      console.error("Error during manual refresh:", err);
    } finally {
      isRefreshing.current = false;
    }
  };

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
