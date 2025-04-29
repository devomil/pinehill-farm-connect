
import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface MessageStatusProps {
  status: string;
  type: string;
  shiftRequest: any;
}

export function MessageStatus({ status, type, shiftRequest }: MessageStatusProps) {
  if (type !== "shift_coverage") return null;

  if (status === "pending") {
    return (
      <div className="mt-4 border-t pt-4">
        <p className="text-sm mb-2 flex items-center">
          <Clock className="h-4 w-4 mr-1 text-amber-500" />
          <span className="text-muted-foreground">
            Waiting for response
          </span>
        </p>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="mt-4 border-t pt-4 text-green-600">
        <p className="text-sm flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Request accepted
        </p>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="mt-4 border-t pt-4 text-red-600">
        <p className="text-sm flex items-center">
          <XCircle className="h-4 w-4 mr-1" />
          Request declined
        </p>
      </div>
    );
  }

  return null;
}
