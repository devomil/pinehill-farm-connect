
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Home, 
  Inbox, 
  Users, 
  BookOpenCheck,
  BookOpen,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarMobileSheetProps {
  open: boolean;
  setOpen: (o: boolean) => void;
  handleLogout: () => void;
}

export const SidebarMobileSheet = ({
  open,
  setOpen,
  handleLogout
}: SidebarMobileSheetProps) => {
  const { currentUser } = useAuth();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-4 right-4">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/employees">
              <Users className="h-5 w-5 mr-2" />
              Employees
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/time">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Time Management
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/calendar">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendar
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/communication">
              <Inbox className="h-5 w-5 mr-2" />
              Communication
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/reports">
              <BarChart3 className="h-5 w-5 mr-2" />
              Reports
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start font-normal">
            <Link to="/training">
              <BookOpen className="h-5 w-5 mr-2" />
              Training Portal
            </Link>
          </Button>
          {currentUser?.role === "admin" && (
            <Button variant="ghost" className="justify-start font-normal">
              <Link to="/admin-training">
                <BookOpenCheck className="h-5 w-5 mr-2" />
                Training Admin
              </Link>
            </Button>
          )}
          <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
