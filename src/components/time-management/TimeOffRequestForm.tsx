
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface TimeOffRequestFormProps {
  currentUser: User;
  onRequestSubmitted: () => void;
}

export const TimeOffRequestForm: React.FC<TimeOffRequestFormProps> = ({ currentUser, onRequestSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("time_off_requests")
        .insert({
          user_id: currentUser.id,
          start_date: startDate,
          end_date: endDate,
          reason,
          status: "pending"
        });

      if (error) throw error;

      // Get the assigned admin from employee_assignments
      const { data: assignment } = await supabase
        .from('employee_assignments')
        .select('admin_id')
        .eq('employee_id', currentUser.id)
        .single();

      if (assignment?.admin_id) {
        // Get admin's profile
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', assignment.admin_id)
          .single();

        if (adminProfile) {
          // Send notification
          await supabase.functions.invoke('send-admin-notification', {
            body: {
              adminEmail: adminProfile.email,
              adminName: adminProfile.name,
              type: "timeoff",
              employeeName: currentUser.name || "An employee",
              details: {
                startDate,
                endDate,
                reason
              }
            },
          });
        }
      }

      toast.success("Time off request submitted successfully");
      setStartDate("");
      setEndDate("");
      setReason("");
      setOpen(false);
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit time off request");
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
