
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
import { CommunicationTabs } from "@/components/communication/CommunicationTabs";
import { useToast } from "@/hooks/use-toast";

export default function Communication() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isAdmin = currentUser?.role === "admin";

  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  useEffect(() => {
    async function fetchEmployees() {
      // In a real app, this would fetch from the database
      // For now, using mock data that includes an updated ID format for the admin user
      setAllEmployees([
        { id: "00000000-0000-0000-0000-000000000001", name: "Admin User", email: "admin@pinehillfarm.co", role: "admin" },
        { id: "00000000-0000-0000-0000-000000000002", name: "John Employee", email: "john@pinehillfarm.co", role: "employee" },
        { id: "00000000-0000-0000-0000-000000000003", name: "Sarah Johnson", email: "sarah@pinehillfarm.co", role: "employee" }
      ]);
    }
    fetchEmployees();
  }, []);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data: annData, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Announcement fetch error:", error);
        toast({ title: "Failed to load announcements", description: error.message, variant: "destructive" });
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      let mappedAnnouncements: Announcement[] = (annData || []).map((a: any) => {
        // Find author in employees
        const author = allEmployees.find(x => x.id === a.author_id);
        
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          createdAt: a.created_at ? new Date(a.created_at) : new Date(),
          author: author?.name || "Unknown",
          priority: a.priority,
          readBy: [],
          hasQuiz: !!a.has_quiz,
          attachments: Array.isArray(a.attachments) ? a.attachments.map((file: any) => file.name) : [],
        };
      });

      if (currentUser) {
        try {
          const { data: reads, error: readsError } = await supabase
            .from("announcement_recipients")
            .select("announcement_id, read_at")
            .eq("user_id", currentUser.id);

          if (readsError) {
            console.error("Read status fetch error:", readsError);
          } else if (reads) {
            mappedAnnouncements = mappedAnnouncements.map(a => ({
              ...a,
              readBy: reads
                .filter((rec: any) => rec.announcement_id === a.id && rec.read_at)
                .length > 0
                ? [currentUser.id]
                : []
            }));
          }
        } catch (err) {
          console.error("Error processing read status:", err);
        }
      }
      setAnnouncements(mappedAnnouncements);
    } catch (err) {
      console.error("Unexpected error in fetchAnnouncements:", err);
      toast({ title: "Failed to load announcements", description: "An unexpected error occurred", variant: "destructive" });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, [allEmployees]); // Re-fetch when employees are loaded

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from("announcement_recipients")
        .update({ read_at: new Date().toISOString() })
        .eq("announcement_id", id)
        .eq("user_id", currentUser.id);
        
      if (error) {
        console.error("Mark as read error:", error);
        toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
        return;
      }
      
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
    } catch (err) {
      console.error("Unexpected error in markAsRead:", err);
      toast({ title: "Failed to mark as read", description: "An unexpected error occurred", variant: "destructive" });
    }
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
        <CommunicationTabs
          announcements={announcements}
          loading={loading}
          isRead={isRead}
          markAsRead={markAsRead}
          getPriorityBadge={getPriorityBadge}
          currentUserId={currentUser?.id}
        />
      </div>
    </DashboardLayout>
  );
}
