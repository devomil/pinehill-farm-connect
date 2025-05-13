
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCommunications } from "@/hooks/useCommunications";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function useCommunicationPageData() {
  const { currentUser } = useAuth();
  
  // State for debug panel
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Get location to parse URL parameters
  const location = useLocation();
  
  // Parse URL parameters for active tab
  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab');
  const isMessagesTab = tabParam === 'messages';
  const [activeTab, setActiveTab] = useState<string>(isMessagesTab ? "messages" : "announcements");
  
  // Get unread messages for the badge counter
  const { unreadMessages, refreshMessages } = useCommunications();
  const { unfilteredEmployees, refetch: refetchEmployees } = useEmployeeDirectory();
  const { refetchData } = useDashboardData();
  
  // Determine if the current user is an admin
  const isAdmin = currentUser?.role === 'admin';
  
  // Use refs to track refresh timers and prevent duplicate refreshes
  const initialDataLoaded = useRef<boolean>(false);
  const lastRefreshTime = useRef<number>(Date.now());
  const refreshTimeoutRef = useRef<number | null>(null);
  const isPageMounted = useRef<boolean>(false);
  const isRefreshing = useRef<boolean>(false);
  const navigationComplete = useRef<boolean>(false);

  // Initial data load - only once when component is mounted
  useEffect(() => {
    isPageMounted.current = true;
    
    if (!initialDataLoaded.current && currentUser) {
      console.log("CommunicationPage mounted, initial data load");
      isRefreshing.current = true;
      
      // Use Promise.all to load data in parallel
      Promise.all([
        refreshMessages(),
        refetchEmployees()
      ]).then(() => {
        if (isPageMounted.current) {
          initialDataLoaded.current = true;
          console.log("Initial communication data loaded");
          lastRefreshTime.current = Date.now();
        }
      }).catch(err => {
        console.error("Error loading initial communication data:", err);
      }).finally(() => {
        isRefreshing.current = false;
      });
    }
    
    // Clear any previous refresh timeouts when unmounting
    return () => {
      isPageMounted.current = false;
      isRefreshing.current = false;
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [refreshMessages, refetchEmployees, currentUser]);
  
  // Handle announcement creation
  const handleAnnouncementCreate = () => {
    console.log("Announcement created, refreshing data");
    toast.success("Announcement created successfully");
    
    // Prevent concurrent refreshes
    if (!isRefreshing.current) {
      isRefreshing.current = true;
      setTimeout(() => {
        if (isPageMounted.current) {
          refreshMessages().finally(() => {
            isRefreshing.current = false;
            lastRefreshTime.current = Date.now();
          });
        }
      }, 1000);
    }
  };
  
  // Handle manual refresh of data - explicitly requested by user
  const handleManualRefresh = () => {
    console.log("Manual refresh requested");
    
    // Prevent multiple concurrent refreshes
    if (isRefreshing.current) {
      toast.info("Refresh already in progress...");
      return;
    }
    
    // Prevent refreshes that happen too quickly
    const now = Date.now();
    if (now - lastRefreshTime.current < 3000) {
      toast.info("Please wait a moment before refreshing again");
      return;
    }
    
    if (refreshTimeoutRef.current !== null) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    toast.info("Refreshing data...");
    isRefreshing.current = true;
    
    // Use Promise.all to load all data in parallel
    Promise.all([
      refreshMessages(),
      refetchEmployees(),
      refetchData()
    ]).then(() => {
      if (isPageMounted.current) {
        toast.success("Data refreshed successfully");
        lastRefreshTime.current = Date.now();
      }
    }).catch(err => {
      console.error("Error refreshing communication data:", err);
      toast.error("Failed to refresh data");
    }).finally(() => {
      isRefreshing.current = false;
    });
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
