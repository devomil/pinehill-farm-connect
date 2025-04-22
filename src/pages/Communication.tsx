
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Announcement, User } from "@/types";
import { AlertTriangle, Bell, CheckCircle, MessageSquare, FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { AdminAnnouncementDialog } from "@/components/communication/AdminAnnouncementDialog";
import { supabase } from "@/integrations/supabase/client";

export default function Communication() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // New: employees loaded from Supabase (for assigning announcements)
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  useEffect(() => {
    async function fetchEmployees() {
      // TODO: If you have a dedicated table for users, fetch from there. This demo uses MOCK_USERS from AuthContext.
      // In production you should fetch real user data from Supabase!
      setAllEmployees([
        { id: "1", name: "Admin User", email: "admin@pinehillfarm.co", role: "admin" },
        { id: "2", name: "John Employee", email: "john@pinehillfarm.co", role: "employee" },
        { id: "3", name: "Sarah Johnson", email: "sarah@pinehillfarm.co", role: "employee" }
      ]);
    }
    fetchEmployees();
  }, []);

  // Announcements from Supabase
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // Get all announcements and their recipients
      const { data: annData, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      let mappedAnnouncements: Announcement[] = (annData || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.created_at ? new Date(a.created_at) : new Date(),
        author: allEmployees.find(x => x.id === a.author_id)?.name || "Admin",
        priority: a.priority,
        readBy: [],
        hasQuiz: !!a.has_quiz,
        attachments: Array.isArray(a.attachments) ? a.attachments.map((file: any) => file.name) : [],
      }));

      // Now fetch which announcements the current user has read from announcement_recipients
      if (currentUser) {
        const { data: reads } = await supabase
          .from("announcement_recipients")
          .select("announcement_id, read_at")
          .eq("user_id", currentUser.id);

        if (reads) {
          mappedAnnouncements = mappedAnnouncements.map(a => ({
            ...a,
            readBy: reads
              .filter((rec: any) => rec.announcement_id === a.id && rec.read_at)
              .length > 0
              ? [currentUser.id]
              : []
          }))
        }
      }
      setAnnouncements(mappedAnnouncements);
    } catch (err) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, []);

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    // Mark as read in DB
    await supabase
      .from("announcement_recipients")
      .update({ read_at: new Date().toISOString() })
      .eq("announcement_id", id)
      .eq("user_id", currentUser.id);
    setAnnouncements(
      announcements.map(announcement => {
        if (announcement.id === id && !announcement.readBy.includes(currentUser.id)) {
          return {
            ...announcement,
            readBy: [...announcement.readBy, currentUser.id]
          };
        }
        return announcement;
      })
    );
  };

  const isRead = (announcement: Announcement) => {
    return currentUser ? announcement.readBy.includes(currentUser.id) : false;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">URGENT</Badge>;
      case "important":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Important</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">FYI</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Communication Center</h1>
            <p className="text-muted-foreground">Company announcements and important information</p>
          </div>
          {isAdmin && (
            <AdminAnnouncementDialog allEmployees={allEmployees} onCreate={fetchAnnouncements} />
          )}
        </div>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {announcements.filter(a => !isRead(a)).length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                  {announcements.filter(a => !isRead(a)).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-10">Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No announcements.</div>
            ) : (
              announcements.map(announcement => (
                <Card
                  key={announcement.id}
                  className={`transition-colors ${
                    isRead(announcement)
                      ? "bg-muted/30"
                      : announcement.priority === "urgent"
                        ? "bg-red-50"
                        : "bg-white"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center">
                          {announcement.title}
                          {isRead(announcement) && (
                            <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {announcement.createdAt.toLocaleDateString()} by {announcement.author}
                        </CardDescription>
                      </div>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">{announcement.content}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {announcement.hasQuiz && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <FileText className="h-3 w-3 mr-1" />
                          Has Quiz
                        </Badge>
                      )}
                      {announcement.attachments?.length > 0 && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {announcement.attachments.length} attachment{announcement.attachments.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div />
                      {!isRead(announcement) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markAsRead(announcement.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="unread" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-10">Loading...</div>
            ) : announcements.filter(a => !isRead(a)).length > 0 ? (
              announcements.filter(a => !isRead(a)).map(announcement => (
                <Card key={announcement.id} className={announcement.priority === "urgent" ? "bg-red-50" : "bg-white"}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <CardDescription>
                          {announcement.createdAt.toLocaleDateString()} by {announcement.author}
                        </CardDescription>
                      </div>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">{announcement.content}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {announcement.hasQuiz && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <FileText className="h-3 w-3 mr-1" />
                          Has Quiz
                        </Badge>
                      )}
                      {announcement.attachments?.length > 0 && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {announcement.attachments.length} attachment{announcement.attachments.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => markAsRead(announcement.id)}
                      >
                        Mark as Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 opacity-50" />
                <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You have read all announcements.
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="urgent" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-10">Loading...</div>
            ) : announcements.filter(a => a.priority === "urgent").length > 0 ? (
              announcements.filter(a => a.priority === "urgent").map(announcement => (
                <Card key={announcement.id} className="bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center">
                          {announcement.title}
                          {isRead(announcement) && (
                            <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {announcement.createdAt.toLocaleDateString()} by {announcement.author}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">URGENT</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm mb-4">{announcement.content}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {announcement.hasQuiz && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <FileText className="h-3 w-3 mr-1" />
                          Has Quiz
                        </Badge>
                      )}
                      {announcement.attachments?.length > 0 && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {announcement.attachments.length} attachment{announcement.attachments.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div />
                      {!isRead(announcement) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markAsRead(announcement.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No urgent announcements</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  There are currently no urgent announcements.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
// Communication.tsx is now over 300 lines. Consider splitting into smaller files!
