import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  CalendarIcon, 
  Home, 
  Megaphone, 
  Users, 
  BookOpenCheck,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useCommunications } from "@/hooks/useCommunications";
import { useDashboardData } from "@/hooks/useDashboardData";
import { isAnnouncementReadByUser } from "@/utils/announcementUtils";

interface SidebarNavProps {
  collapsed: boolean;
}

export const SidebarNav = ({ collapsed }: SidebarNavProps) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const { unreadMessages, refreshMessages } = useCommunications();
  const { announcements, refetchData } = useDashboardData();
  
  // Count unread messages
  const unreadMessageCount = unreadMessages?.length || 0;
  
  // Count unread announcements - exclude those requiring acknowledgment and those already read
  const unreadAnnouncementCount = announcements
    ? announcements.filter(a => {
        return !isAnnouncementReadByUser(a, currentUser?.id) && 
          !a.requires_acknowledgment;
      }).length
    : 0;

  // Refresh data when navigating to comms page
  useEffect(() => {
    if (pathname === '/communication' || pathname.includes('/communication?tab=')) {
      console.log('On communications page, refreshing data');
      refreshMessages();
      refetchData();
    }
  }, [pathname, refreshMessages, refetchData]);

  // Group for main navigation
  const mainNavItems = [
    {
      to: "/dashboard",
      icon: <Home className="h-5 w-5 mr-3" />,
      label: "Dashboard",
      showIf: true,
      badge: null,
    },
    {
      to: "/employees",
      icon: <Users className="h-5 w-5 mr-3" />,
      label: "Employees",
      showIf: currentUser?.role === "admin",
      badge: null,
    },
    {
      to: "/time",
      icon: <CalendarIcon className="h-5 w-5 mr-3" />,
      label: "Time Management",
      showIf: true,
      badge: null,
    }
  ];

  // Group for communication features
  const communicationItems = [
    {
      to: "/communication",
      icon: <Megaphone className="h-5 w-5 mr-3" />,
      label: "Announcements",
      showIf: true,
      badge: unreadAnnouncementCount > 0 ? (
        <Badge className="ml-auto">{unreadAnnouncementCount}</Badge>
      ) : null,
    },
    {
      to: "/communication?tab=messages",
      icon: <MessageSquare className="h-5 w-5 mr-3" />,
      label: "Messages",
      showIf: true,
      badge: unreadMessageCount > 0 ? (
        <Badge variant="destructive" className="ml-auto">{unreadMessageCount}</Badge>
      ) : null,
    }
  ];

  // Group for reporting and training
  const toolsItems = [
    {
      to: "/reports",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
      label: "Reports",
      showIf: true,
      badge: null,
    },
    {
      to: "/training",
      icon: <BookOpen className="h-5 w-5 mr-3" />,
      label: "Training Portal",
      showIf: true,
      badge: null,
    },
    {
      to: "/admin-training",
      icon: <BookOpenCheck className="h-5 w-5 mr-3" />,
      label: "Training Admin",
      showIf: currentUser?.role === "admin",
      badge: null,
    }
  ];

  return (
    <nav className="flex flex-col gap-4 px-2">
      {/* Main navigation group */}
      <div className="flex flex-col gap-1">
        {mainNavItems.map(item => 
          item.showIf && (
            <Button
              key={item.to}
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                pathname === item.to && "bg-accent"
              )}
              asChild
            >
              <Link to={item.to} className="flex w-full items-center">
                {item.icon}
                <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
                {!collapsed && item.badge}
              </Link>
            </Button>
          )
        )}
      </div>
      
      {/* Communication group with separator */}
      <div>
        {!collapsed && (
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-muted-foreground">COMMUNICATION</p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {communicationItems.map(item => 
            item.showIf && (
              <Button
                key={item.to}
                variant={item.badge !== null ? "default" : "ghost"}
                className={cn(
                  "justify-start font-normal",
                  (pathname === item.to || pathname === "/communications" || 
                   (pathname.includes('/communication') && item.to.includes(pathname.includes('?tab=messages') ? 'messages' : 'communication'))) 
                  && "bg-accent"
                )}
                asChild
              >
                <Link to={item.to} className="flex w-full items-center">
                  {item.icon}
                  <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
                  {!collapsed && item.badge}
                  {collapsed && item.badge && (
                    <Badge 
                      variant={item.to.includes("messages") ? "destructive" : "default"} 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {item.to.includes("messages") ? unreadMessageCount : unreadAnnouncementCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )
          )}
        </div>
      </div>

      {/* Tools group with separator */}
      <div>
        {!collapsed && (
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-muted-foreground">TOOLS</p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {toolsItems.map(item => 
            item.showIf && (
              <Button
                key={item.to}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  pathname.includes(item.to) && item.to !== "/training" ? "bg-accent" :
                  (pathname.includes("/training") && pathname !== "/admin-training" && item.to === "/training") ? "bg-accent" : ""
                )}
                asChild
              >
                <Link to={item.to} className="flex w-full items-center">
                  {item.icon}
                  <span className={!collapsed ? "block" : "hidden"}>{item.label}</span>
                  {!collapsed && item.badge}
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
