import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createDebugContext } from '@/utils/debugUtils';

/**
 * Specialized hook for debugging navigation issues with the messages tab
 * This will help diagnose why users are being "kicked out" of Direct Messages
 */
export function useNavigationDebugger() {
  const debug = createDebugContext('NavigationDebugger');
  const location = useLocation();
  const navigate = useNavigate();
  const navigationHistory = useRef<{path: string, timestamp: number}[]>([]);
  const tabSwitchCount = useRef(0);
  const lastMessageTabAt = useRef(0);
  const potentialLoopDetected = useRef(false);
  
  // Monitor for navigation changes and potential loops
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const now = Date.now();
    
    // Record this navigation in history
    navigationHistory.current.push({
      path: currentPath,
      timestamp: now
    });
    
    // Keep history manageable
    if (navigationHistory.current.length > 20) {
      navigationHistory.current.shift();
    }
    
    // Check if we've navigated to messages tab
    if (currentPath.includes('tab=messages')) {
      lastMessageTabAt.current = now;
      tabSwitchCount.current++;
      
      debug.info("Navigated to messages tab", {
        switchCount: tabSwitchCount.current,
        time: new Date().toISOString()
      });
    } 
    
    // Check if we've rapidly switched away from messages tab
    if (lastMessageTabAt.current > 0 && 
        !currentPath.includes('tab=messages') && 
        now - lastMessageTabAt.current < 2000) {
      
      debug.warn("Rapid exit from messages tab detected", {
        timeInMessagesTab: now - lastMessageTabAt.current,
        previousPath: navigationHistory.current[navigationHistory.current.length - 2]?.path
      });
      
      // If we've had multiple rapid switches, we might have a loop
      if (tabSwitchCount.current > 3 && !potentialLoopDetected.current) {
        potentialLoopDetected.current = true;
        
        debug.error("Potential navigation loop detected", {
          navigationHistory: navigationHistory.current.slice(-5),
          currentLocation: currentPath
        });
        
        // Show warning to user
        toast.error(
          "Navigation issue detected with direct messages", 
          { 
            description: "View the diagnostics panel for details", 
            duration: 5000,
            id: 'nav-loop-detected'
          }
        );
      }
    }
    
  }, [location, debug]);
  
  // Recovery function to try to stabilize navigation
  const attemptRecovery = () => {
    potentialLoopDetected.current = false;
    tabSwitchCount.current = 0;
    
    // Force navigation to messages tab with special recovery flag
    navigate('/communication?tab=messages&recovery=true', { replace: true });
    
    debug.info("Navigation recovery attempted", {
      historyCleared: true,
      timestamp: new Date().toISOString()
    });
    
    toast.success("Navigation recovery attempted");
  };
  
  return {
    navigationHistory: navigationHistory.current,
    hasLoopDetected: potentialLoopDetected.current,
    tabSwitchCount: tabSwitchCount.current,
    timeInMessagesTab: lastMessageTabAt.current > 0 ? 
      Date.now() - lastMessageTabAt.current : 0,
    attemptRecovery
  };
}
