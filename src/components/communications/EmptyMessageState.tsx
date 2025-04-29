
import React from "react";

export function EmptyMessageState() {
  return (
    <div className="text-center p-8">
      <p className="text-lg font-medium">No messages yet</p>
      <p className="text-muted-foreground">
        Send a message using the "New Message" button
      </p>
    </div>
  );
}
