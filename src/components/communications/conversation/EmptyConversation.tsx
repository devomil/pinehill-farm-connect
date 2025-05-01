
import React from "react";
import { MessageCircle } from "lucide-react";

export function EmptyConversation() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Select an employee to view messages</p>
        <p className="text-muted-foreground">
          Your conversations will appear here
        </p>
      </div>
    </div>
  );
}
