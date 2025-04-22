
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { TimeOffRequest, User } from "@/types";
import { notifyManager } from "@/utils/notifyManager";

interface TimeOffRequestFormProps {
  currentUser: User;
  onRequest: (request: TimeOffRequest) => void;
}

export const TimeOffRequestForm: React.FC<TimeOffRequestFormProps> = ({ currentUser, onRequest }) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: TimeOffRequest = {
      id: `${Date.now()}`,
      userId: currentUser.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "pending",
    };
    onRequest(newRequest);
    setStartDate("");
    setEndDate("");
    setReason("");
    setOpen(false);

    notifyManager(
      "time_off_request",
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      { request: { startDate, endDate, reason } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit your time off request. You'll be notified when it's approved.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe your time off reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
