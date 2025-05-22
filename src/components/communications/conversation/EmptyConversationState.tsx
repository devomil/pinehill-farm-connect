
import React from "react";
import { Alert } from "@/components/ui/alert";

export function EmptyConversationState() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <Alert className="mx-auto max-w-md">
        <p>No messages yet. Send a message to start the conversation.</p>
      </Alert>
    </div>
  );
}
