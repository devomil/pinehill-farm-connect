
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Calendar, Clock, MessageSquare, FileText, AlertTriangle, Book } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();

  // Mock data for dashboard
  const employeeDashboardData = {
    upcomingTraining: [
      { id: 1, title: "HIPAA Compliance", dueDate: "2023-05-15" },
      { id: 2, title: "CBD101", dueDate: "2023-05-25" },
    ],
    pendingTimeOff: [
      { id: 1, startDate: "2023-06-10", endDate: "2023-06-15", status: "pending" },
    ],
    recentAnnouncements: [
      { 
        id: 1, 
        title: "New Packaging Guidelines", 
        priority: "important", 
        date: "2023-05-01" 
      },
      { 
        id: 2, 
        title: "Team Meeting - Wednesday", 
        priority: "fyi", 
        date: "2023-04-29" 
      },
    ],
  };

  const adminDashboardData = {
    ...employeeDashboardData,
    pendingApprovals: 3,
    newShiftReports: 2,
    expiredCertifications: 4,
  };

  const isAdmin = currentUser?.role === "admin";
  const dashboardData = isAdmin ? adminDashboardData : employeeDashboardData;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {currentUser?.name}</h1>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pending Time-Off Approvals</p>
                    <h3 className="text-2xl font-bold">{adminDashboardData.pendingApprovals}</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">New Shift Reports</p>
                    <h3 className="text-2xl font-bold">{adminDashboardData.newShiftReports}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Expired Certifications</p>
                    <h3 className="text-2xl font-bold">{adminDashboardData.expiredCertifications}</h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Training</CardTitle>
                <Book className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Training due soon</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingTraining.length > 0 ? (
                <ul className="space-y-2">
                  {dashboardData.upcomingTraining.map((training) => (
                    <li key={training.id} className="flex justify-between items-center">
                      <span>{training.title}</span>
                      <span className="text-sm text-muted-foreground">Due: {training.dueDate}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No upcoming training due</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Off</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Your pending requests</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.pendingTimeOff.length > 0 ? (
                <ul className="space-y-2">
                  {dashboardData.pendingTimeOff.map((timeOff) => (
                    <li key={timeOff.id} className="flex justify-between items-center">
                      <span>{timeOff.startDate} to {timeOff.endDate}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {timeOff.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No pending time off requests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Announcements</CardTitle>
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Latest company updates</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentAnnouncements.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.recentAnnouncements.map((announcement) => (
                    <li key={announcement.id} className="flex justify-between items-center">
                      <div>
                        <p>{announcement.title}</p>
                        <p className="text-xs text-muted-foreground">{announcement.date}</p>
                      </div>
                      <span 
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${announcement.priority === "urgent" 
                            ? "bg-red-100 text-red-800" 
                            : announcement.priority === "important" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {announcement.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No recent announcements</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <Bell className="h-4 w-4 text-amber-800" />
          <AlertTitle>Reminder</AlertTitle>
          <AlertDescription>
            Don't forget to complete your HIPAA Compliance training by May 15th.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
}
