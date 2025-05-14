import React, { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface NewMessageDialogProps {
  employees: User[];
  onSend: (data: any) => void;
  onClose: () => void;
  onRefresh?: () => void;
}

interface MessageData {
  recipientId: string;
  content: string;
}

export function NewMessageDialog({
  employees,
  onSend,
  onClose,
  onRefresh
}: NewMessageDialogProps) {
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId || !content) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const messageData: MessageData = {
        recipientId: recipientId,
        content: content,
      };
      await onSend(messageData);
      toast({
        title: "Message sent!",
        variant: "success",
      });
      setContent("");
      setRecipientId("");
      onClose();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Send New Message</DialogTitle>
        <DialogDescription>
          Select a recipient and compose your message below.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="recipient">Recipient</Label>
          <select
            id="recipient"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a recipient</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={loading} onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
