
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  onRespond: any;
  employees: User[];
}

export function MessageList({ messages, isLoading, onRespond, employees }: MessageListProps) {
  const { currentUser } = useAuth();

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground">No messages yet</div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.sender_id === currentUser?.id
                ? "bg-primary/10 ml-12"
                : "bg-muted mr-12"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">
                  {message.sender_id === currentUser?.id
                    ? "You"
                    : getEmployeeName(message.sender_id)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(message.created_at), "PPp")}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {message.type === "shift_coverage" && `Status: ${message.status}`}
              </div>
            </div>

            <p className="mb-2">{message.message}</p>

            {message.type === "shift_coverage" && message.shift_coverage_requests?.[0] && (
              <div className="bg-background p-3 rounded mt-2">
                <h4 className="font-medium mb-1">Shift Coverage Request</h4>
                <p className="text-sm">
                  Date: {format(new Date(message.shift_coverage_requests[0].shift_date), "PP")}
                  <br />
                  Time: {message.shift_coverage_requests[0].shift_start} - {message.shift_coverage_requests[0].shift_end}
                </p>

                {message.recipient_id === currentUser?.id && message.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        onRespond.mutate({
                          communicationId: message.id,
                          shiftRequestId: message.shift_coverage_requests[0].id,
                          accept: true
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onRespond.mutate({
                          communicationId: message.id,
                          shiftRequestId: message.shift_coverage_requests[0].id,
                          accept: false
                        })
                      }
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
