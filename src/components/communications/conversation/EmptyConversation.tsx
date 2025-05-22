
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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
      navigate(`/communication?tab=messages&recovery=true&ts=${timestamp}`, { replace: true });
    }
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
