
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  Book,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Home,
  Users,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["employee", "admin"],
    },
    {
      name: "Time Management",
      href: "/time-management",
      icon: Clock,
      roles: ["employee", "admin"],
    },
    {
      name: "Training Portal",
      href: "/training",
      icon: Book,
      roles: ["employee", "admin"],
    },
    {
      name: "Communication",
      href: "/communication",
      icon: MessageSquare,
      roles: ["employee", "admin"],
    },
    {
      name: "Shift Reports",
      href: "/reports",
      icon: FileText,
      roles: ["employee", "admin"],
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
      roles: ["employee", "admin"],
    },
    {
      name: "Employee Management",
      href: "/employees",
      icon: Users,
      roles: ["admin"],
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-muted border-r transition-all duration-300 ease-in-out z-10",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {collapsed ? (
          <div className="mx-auto">
            <img
              src="/lovable-uploads/5475bb37-9a4d-4088-af2e-92926b00f241.png" 
              alt="PineHill Farm"
              className="h-8"
            />
          </div>
        ) : (
          <div className="flex-1">
            <img
              src="/lovable-uploads/5475bb37-9a4d-4088-af2e-92926b00f241.png" 
              alt="PineHill Farm"
              className="h-12"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground"
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden py-4 gap-1">
        {navItems
          .filter((item) => currentUser && item.roles.includes(currentUser.role))
          .map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-2 mx-2 rounded-md hover:bg-accent group transition-colors",
                isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mr-3", collapsed && "mr-0")} />
              <span className={cn("", collapsed && "hidden")}>
                {item.name}
              </span>
            </Link>
          ))}
      </div>

      <div className="p-4 border-t mt-auto">
        {!collapsed && (
          <div className="flex items-center mb-4 px-4 py-2">
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          onClick={logout}
          className={cn(
            "flex items-center w-full justify-center",
            collapsed ? "p-2" : ""
          )}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
