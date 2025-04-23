
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Fetch pending time off requests (for admin)
  const { data: pendingTimeOff } = useQuery({
    queryKey: ['pendingTimeOff'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin
  });

  // Fetch user's own time off requests
  const { data: userTimeOff } = useQuery({
    queryKey: ['userTimeOff', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', currentUser?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  // Fetch recent announcements
  const { data: announcements } = useQuery({
    queryKey: ['recentAnnouncements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch assigned trainings
  const { data: assignedTrainings } = useQuery({
    queryKey: ['assignedTrainings', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_assignments')
        .select(`
          *,
          trainings (
            title,
            duration,
            expires_after
          )
        `)
        .eq('user_id', currentUser?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {currentUser?.name}</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pending Time-Off Requests</p>
                    <h3 className="text-2xl font-bold">{pendingTimeOff?.length || 0}</h3>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {assignedTrainings && assignedTrainings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Training</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Your pending trainings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assignedTrainings.map((training) => (
                    <li key={training.id} className="flex justify-between items-center">
                      <span>{training.trainings?.title}</span>
                      {training.trainings?.duration && (
                        <span className="text-sm text-muted-foreground">
                          {training.trainings.duration} minutes
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {userTimeOff && userTimeOff.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Time Off Requests</CardTitle>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Your pending requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {userTimeOff.map((timeOff) => (
                    <li key={timeOff.id} className="flex justify-between items-center">
                      <span>
                        {new Date(timeOff.start_date).toLocaleDateString()} to{' '}
                        {new Date(timeOff.end_date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {timeOff.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {announcements && announcements.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Announcements</CardTitle>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Latest company updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {announcements.map((announcement) => (
                    <li key={announcement.id} className="flex justify-between items-center">
                      <div>
                        <p>{announcement.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
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
              </CardContent>
            </Card>
          )}
        </div>

        {assignedTrainings && assignedTrainings.length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-800" />
            <AlertTitle>Training Reminder</AlertTitle>
            <AlertDescription>
              You have {assignedTrainings.length} pending training{assignedTrainings.length > 1 ? 's' : ''} to complete.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
