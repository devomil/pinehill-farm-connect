import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeOffRequest } from "@/types";
import { Calendar, Clock, Plus } from "lucide-react";
import { notifyManager } from "@/utils/notifyManager";

export default function TimeManagement() {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([
    {
      id: "1",
      userId: "2",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-06-15"),
      reason: "Family vacation",
      status: "pending",
    },
    {
      id: "2",
      userId: "2",
      startDate: new Date("2023-04-21"),
      endDate: new Date("2023-04-21"),
      reason: "Doctor appointment",
      status: "approved",
    },
  ]);

  const pendingRequests = timeOffRequests.filter(
    (request) => request.status === "pending"
  );

  const userRequests = timeOffRequests.filter(
    (request) => currentUser && request.userId === currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentUser) {
      const newRequest: TimeOffRequest = {
        id: `${Date.now()}`,
        userId: currentUser.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "pending",
      };
      
      setTimeOffRequests([newRequest, ...timeOffRequests]);
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
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Time Management</h1>
            <p className="text-muted-foreground">Request and manage time off</p>
          </div>

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
        </div>

        <Tabs defaultValue="my-requests">
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {isAdmin && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
            <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-requests" className="space-y-4 pt-4">
            {userRequests.length > 0 ? (
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {request.startDate.toLocaleDateString()} to {request.endDate.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                            ${request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : request.status === 'rejected' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No time-off requests yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first time-off request to get started.
                </p>
                <Button className="mt-4" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>
            )}
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="pending-approvals" className="space-y-4 pt-4">
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium mb-1">John Employee</h4>
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {request.startDate.toLocaleDateString()} to {request.endDate.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{request.reason}</p>
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
                              Reject
                            </Button>
                            <Button variant="outline" size="sm" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700">
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No pending approvals</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    All time-off requests have been processed.
                  </p>
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="team-calendar" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Calendar</CardTitle>
                <CardDescription>View team availability and scheduled time off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">Calendar View Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We're working on a visual calendar to help you see team coverage at a glance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
