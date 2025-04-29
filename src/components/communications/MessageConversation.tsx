
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { format } from "date-fns";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/alert";

interface MessageConversationProps {
  selectedEmployee: User | null;
  messages: any[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export function MessageConversation({
  selectedEmployee,
  messages,
  isLoading,
  onSendMessage,
  onBack
}: MessageConversationProps) {
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const messageEndRef = React.useRef<HTMLDivElement>(null);

  // Filter messages between the current user and selected employee
  useEffect(() => {
    if (selectedEmployee && messages && currentUser) {
      const relevant = messages.filter(
        (msg) =>
          (msg.sender_id === currentUser.id &&
            msg.recipient_id === selectedEmployee.id) ||
          (msg.sender_id === selectedEmployee.id &&
            msg.recipient_id === currentUser.id)
      );
      
      // Sort by date ascending (oldest first)
      relevant.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setFilteredMessages(relevant);
    } else {
      setFilteredMessages([]);
    }
  }, [selectedEmployee, messages, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedEmployee) {
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

  return (
    <div className="flex flex-col h-[70vh] border rounded-md">
      {/* Header */}
      <div className="p-3 border-b flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-medium">{selectedEmployee.name}</h3>
          <p className="text-xs text-muted-foreground">{selectedEmployee.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    i % 2 === 0 ? "bg-muted" : "bg-primary text-primary-foreground"
                  } rounded-lg p-3`}
                >
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-full" />
                  <div className="text-xs mt-1 opacity-70">
                    <Skeleton className="h-3 w-16 inline-block" />
                  </div>
                </div>
              </div>
            ))
        ) : filteredMessages.length === 0 ? (
          <Alert className="mx-auto max-w-md">
            <p>No messages yet. Send a message to start the conversation.</p>
          </Alert>
        ) : (
          filteredMessages.map((message) => {
            const isMine = message.sender_id === currentUser?.id;
            const hasShiftDetails = message.shift_coverage_requests && message.shift_coverage_requests.length > 0;
            const shiftRequest = hasShiftDetails ? message.shift_coverage_requests[0] : null;
            
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } rounded-lg p-3`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.message}</p>
                  
                  {hasShiftDetails && shiftRequest && (
                    <div className="mt-2 p-2 bg-background/60 rounded text-sm">
                      <div className="font-medium mb-1">Shift Coverage Request:</div>
                      <div><span className="font-medium">Date:</span> {shiftRequest.shift_date}</div>
                      <div><span className="font-medium">Time:</span> {shiftRequest.shift_start} - {shiftRequest.shift_end}</div>
                      <div className="mt-1"><span className="font-medium">Status:</span> {message.status}</div>
                    </div>
                  )}
                  
                  <div className="text-xs mt-1 opacity-70">
                    {format(new Date(message.created_at), "MMM d, h:mm a")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-10 resize-none"
          />
          <Button
            className="ml-2"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
