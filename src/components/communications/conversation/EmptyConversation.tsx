
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare } from "lucide-react";

interface EmptyConversationProps {
  onRefresh?: () => void;
}

export function EmptyConversation({ onRefresh }: EmptyConversationProps) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Messages Found</h3>
      <p className="text-muted-foreground mb-4">
        You don't have any messages yet. Select an employee to start a conversation.
      </p>
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
