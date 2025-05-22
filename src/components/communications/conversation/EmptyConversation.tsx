
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

interface EmptyConversationProps {
  onRefresh?: () => void;
  hasNavigationIssues?: boolean;
}

export function EmptyConversation({ onRefresh, hasNavigationIssues }: EmptyConversationProps) {
  const location = useLocation();
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true';
  
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
          </p>
        </div>
      )}
      
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
    </Card>
  );
}
