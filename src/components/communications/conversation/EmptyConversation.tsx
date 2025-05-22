
import React from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyConversationProps {
  onRefresh?: () => void;
}

export function EmptyConversation({ onRefresh }: EmptyConversationProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64 border border-dashed rounded-md bg-muted/20">
      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
      <p className="text-muted-foreground mb-4">
        Select an employee from the list to start a conversation or view your existing messages.
      </p>
      
      {onRefresh && (
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="mt-2"
          size="sm"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Refresh Messages
        </Button>
      )}
    </div>
  );
}
