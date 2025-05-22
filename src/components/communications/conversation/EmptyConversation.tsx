
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EmptyConversationProps {
  onRefresh?: () => void;
  hasNavigationIssues?: boolean;
}

export function EmptyConversation({ onRefresh, hasNavigationIssues }: EmptyConversationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true';
  const urlTabParam = new URLSearchParams(location.search).get('tab');
  
  // Function to force a complete recovery
  const forceTabSync = () => {
    // Ensure the URL tab parameter matches the active component
    if (urlTabParam === 'messages') {
      // Force a hard refresh with recovery mode
      const timestamp = Date.now();
      toast.success("Fixing navigation mismatch");
      navigate(`/communication?tab=messages&recovery=true&ts=${timestamp}`, { replace: true });
    }
  };

  // Function to perform a thorough recovery when issues are detected
  const performFullRecovery = () => {
    // Clear all navigation state
    window.sessionStorage.removeItem('communication_recovery');
    localStorage.removeItem('last_communication_tab');
    
    // Set fresh recovery flag
    window.sessionStorage.setItem('communication_recovery', 'true');
    
    // Add current timestamp to avoid caching issues
    const timestamp = Date.now();
    
    // Show recovery feedback
    toast.loading("Starting deep navigation recovery...", { id: "recovery-toast" });
    
    // Always force navigation to announcements tab first to reset UI state
    navigate('/communication?tab=announcements&recovery=true', { replace: true });
    
    // After a longer delay, allow navigation back to messages tab with recovery mode
    setTimeout(() => {
      // Force the active tab in the URL
      const messagesRecoveryUrl = `/communication?tab=messages&recovery=true&ts=${timestamp}`;
      navigate(messagesRecoveryUrl, { replace: true });
      
      // After a bit more delay, update the toast
      setTimeout(() => {
        toast.success("Navigation recovery complete", { id: "recovery-toast" });
      }, 500);
    }, 2000);
  };
  
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Messages Found</h3>
      <p className="text-muted-foreground mb-4">
        You don't have any messages yet. Select an employee to start a conversation.
      </p>
      
      {isRecoveryMode && (
        <div className="border-t border-dashed w-full pt-4 mt-2 mb-4">
          <div className="flex items-center mb-2 text-amber-600 gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Recovery Mode Active</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Navigation recovery enabled to stabilize the Direct Messages tab.
            {urlTabParam !== 'messages' && (
              <span className="block mt-1 text-amber-600">
                Note: URL shows "messages" tab but you're viewing "{urlTabParam || 'unknown'}".
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-blue-500" 
                  onClick={forceTabSync}
                >
                  Fix this issue
                </Button>
              </span>
            )}
          </p>
        </div>
      )}
      
      {hasNavigationIssues && (
        <div className="border border-destructive/20 bg-destructive/10 rounded-md p-3 mb-4 w-full">
          <div className="flex items-center text-destructive gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Navigation Issues Detected</span>
          </div>
          <p className="text-xs mb-3 text-destructive/80">
            We've detected issues with the Direct Messages tab navigation.
            Try the recovery option below to resolve the problem.
          </p>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={performFullRecovery}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Perform Deep Recovery
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        
        {isRecoveryMode && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {
              // Force a clean navigation state and reload without recovery mode
              window.sessionStorage.removeItem('communication_recovery');
              toast.success("Exiting recovery mode");
              window.location.href = '/communication?tab=messages';
            }}
            className="mt-2"
          >
            Exit Recovery Mode
          </Button>
        )}
      </div>
    </Card>
  );
}
