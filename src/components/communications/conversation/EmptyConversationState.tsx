
import React from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MessageSquare } from "lucide-react";

export function EmptyConversationState() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <EmptyState
        message="No messages yet"
        description="Send a message to start the conversation"
        icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
        variant="inline"
      />
    </div>
  );
}
