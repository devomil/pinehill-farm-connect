
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  onRespond: (data: { communicationId: string; shiftRequestId: string; accept: boolean; senderId: string }) => void;
  employees: User[];
  onViewConversation?: (employee: User) => void; // Add prop for viewing conversation
}

export function MessageList({ messages, isLoading, onRespond, employees, onViewConversation }: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-16 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-muted-foreground">
          Send a message using the "New Message" button
        </p>
      </div>
    );
  }

  const getEmployeeName = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    return employee?.name || "Unknown User";
  };

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id);
  };

  const renderMessageStatus = (status: string, type: string, shiftRequest: any, message: any) => {
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
  };

  const renderResponseButtons = (message: any) => {
    // Only show response buttons for shift coverage requests directed at the current user
    // that are still pending
    if (
      message.type === "shift_coverage" &&
      message.status === "pending" &&
      message.recipient_id === message.current_user_id
    ) {
      const shiftRequest = message.shift_coverage_requests?.[0];
      if (!shiftRequest) return null;

      return (
        <div className="flex gap-2 mt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => onRespond({
              communicationId: message.id,
              shiftRequestId: shiftRequest.id,
              accept: true,
              senderId: message.sender_id
            })}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRespond({
              communicationId: message.id,
              shiftRequestId: shiftRequest.id,
              accept: false,
              senderId: message.sender_id
            })}
          >
            Decline
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isIncoming = message.recipient_id === message.current_user_id;
        const shiftRequest = message.shift_coverage_requests?.[0];
        
        // Determine which user to show in the conversation link
        const conversationUser = isIncoming 
          ? getEmployeeById(message.sender_id)
          : getEmployeeById(message.recipient_id);
        
        return (
          <div
            key={message.id}
            className={`p-4 border rounded-md ${
              isIncoming ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex justify-between mb-2">
              <div className="font-medium">
                {isIncoming
                  ? `From: ${getEmployeeName(message.sender_id)}`
                  : `To: ${getEmployeeName(message.recipient_id)}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(message.created_at), "MMM d, h:mm a")}
              </div>
            </div>

            <p className="mb-2">{message.message}</p>

            {message.type === "shift_coverage" && shiftRequest && (
              <div className="bg-muted/30 p-3 rounded-md text-sm mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {shiftRequest.shift_date}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {shiftRequest.shift_start} - {shiftRequest.shift_end}
                  </div>
                </div>
              </div>
            )}

            {renderMessageStatus(message.status, message.type, shiftRequest, message)}
            
            <div className="flex justify-between items-center mt-4">
              {renderResponseButtons(message)}
              
              {onViewConversation && conversationUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => onViewConversation(conversationUser)}
                >
                  View Conversation 
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
