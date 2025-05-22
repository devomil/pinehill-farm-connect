
import { useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Custom hook to manage tab navigation state and logic
 */
export function useTabNavigation(activeTab: string, setActiveTab: (tab: string) => void, forceRefreshData: () => void, fetchRequests: () => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const lastTabChange = useRef<number>(0);
  const pendingRefreshTimeoutRef = useRef<number | null>(null);
  const toastIdRef = useRef<string | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (pendingRefreshTimeoutRef.current !== null) {
        clearTimeout(pendingRefreshTimeoutRef.current);
      }
      
      // Clear any active toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

  // Handle URL query parameters for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    
    if (tabFromUrl && activeTab !== tabFromUrl) {
      console.log(`Setting tab from URL: ${tabFromUrl}`);
      setActiveTab(tabFromUrl);
    }
    
    // Clear any active toast when URL changes
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    return () => {
      // Clean up any pending timeouts
      if (pendingRefreshTimeoutRef.current !== null) {
        clearTimeout(pendingRefreshTimeoutRef.current);
        pendingRefreshTimeoutRef.current = null;
      }
    };
  }, [location.search, setActiveTab, activeTab]);

  // Tab change handler
  const handleTabChange = useCallback((value: string) => {
    // Skip if we're already on this tab
    if (value === activeTab) {
      console.log(`Already on tab ${value}, skipping change`);
      return;
    }
    
    // Prevent rapid tab switching (add throttling)
    const now = Date.now();
    if (now - lastTabChange.current < 1000) {
      console.log(`Tab change throttled, too soon since last change`);
      return;
    }
    
    console.log(`Tab changing from ${activeTab} to ${value}`);
    lastTabChange.current = now;
    
    // Clear any pending refresh timeout
    if (pendingRefreshTimeoutRef.current !== null) {
      clearTimeout(pendingRefreshTimeoutRef.current);
      pendingRefreshTimeoutRef.current = null;
    }
    
    setActiveTab(value);
    
    // Update URL query parameter
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    navigate(`/time?${params.toString()}`, { replace: true });
    
    // Only refresh data for certain tabs and not too frequently
    if (value === "shift-coverage") {
      // Clear any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      
      // Delay refresh to prevent navigation loop
      pendingRefreshTimeoutRef.current = window.setTimeout(() => {
        console.log("Refreshing shift coverage data after delay");
        forceRefreshData();
        pendingRefreshTimeoutRef.current = null;
      }, 1000) as unknown as number;
    } else if (value === "my-requests") {
      // Clear any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      
      // Delay refresh to prevent navigation loop
      pendingRefreshTimeoutRef.current = window.setTimeout(() => {
        console.log("Refreshing time-off requests data after delay");
        fetchRequests();
        pendingRefreshTimeoutRef.current = null;
      }, 1000) as unknown as number;
    }
  }, [activeTab, setActiveTab, forceRefreshData, fetchRequests, location.search, navigate]);

  return {
    handleTabChange,
    toastIdRef,
    pendingRefreshTimeoutRef
  };
}
