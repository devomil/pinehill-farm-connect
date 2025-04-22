
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Announcement } from "@/types";
import { AlertTriangle, Bell, CheckCircle, MessageSquare, FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function Communication() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Mock announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "New Packaging Guidelines",
      content: "Starting next month, we will be implementing new packaging guidelines for all CBD products. Please review the attached document for details.",
      createdAt: new Date("2023-05-01"),
      author: "Admin User",
      priority: "important",
      readBy: ["2"],
      hasQuiz: true,
      attachments: ["packaging_guidelines.pdf"]
    },
    {
      id: "2",
      title: "Team Meeting - Wednesday",
      content: "Reminder that we have our monthly team meeting this Wednesday at 9am in the main barn. Everyone is required to attend.",
      createdAt: new Date("2023-04-29"),
      author: "Admin User",
      priority: "fyi",
      readBy: [],
      hasQuiz: false
    },
    {
      id: "3",
      title: "URGENT: Equipment Maintenance",
      content: "The salt generator in the processing room is currently under maintenance. Please do not use it until further notice.",
      createdAt: new Date("2023-04-28"),
      author: "Admin User",
      priority: "urgent",
      readBy: ["2", "3"],
      hasQuiz: false
    }
  ]);

  const markAsRead = (id: string) => {
    if (!currentUser) return;
    
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
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
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
            {announcements.map(announcement => (
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
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
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
            ))}
          </TabsContent>
          
          <TabsContent value="unread" className="space-y-4 mt-4">
            {announcements.filter(a => !isRead(a)).length > 0 ? (
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
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
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
            {announcements.filter(a => a.priority === "urgent").length > 0 ? (
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
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
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
