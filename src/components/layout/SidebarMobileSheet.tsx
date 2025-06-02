
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
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMainNavItems, getCommunicationNavItems, getToolsNavItems, filterNavItemsByRole } from "@/config/navConfig";
import { DebugButton } from "@/components/debug/DebugButton";

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
  const navigate = useNavigate();
  
  // Get navigation items by section and filter by role
  const mainNavItems = filterNavItemsByRole(getMainNavItems(), currentUser?.role);
  const communicationNavItems = filterNavItemsByRole(getCommunicationNavItems(), currentUser?.role);
  const toolsNavItems = filterNavItemsByRole(getToolsNavItems(), currentUser?.role);

  const handleDebugClick = () => {
    navigate("/diagnostics");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-4 right-4">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Access all 9 essential pages of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {/* Main Navigation */}
          {mainNavItems.map(item => (
            <Button key={item.id} variant="ghost" className="justify-start font-normal">
              <Link to={item.path} className="flex items-center" onClick={() => setOpen(false)}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          
          {/* Communication Section */}
          {communicationNavItems.length > 0 && (
            <>
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1 border-t pt-4">
                COMMUNICATION
              </div>
              {communicationNavItems.map(item => (
                <Button key={item.id} variant="ghost" className="justify-start font-normal">
                  <Link to={item.path} className="flex items-center" onClick={() => setOpen(false)}>
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              ))}
            </>
          )}
          
          {/* Tools Section */}
          {toolsNavItems.length > 0 && (
            <>
              <div className="text-xs font-semibold text-muted-foreground px-2 py-1 border-t pt-4">
                TOOLS
              </div>
              {toolsNavItems.map(item => (
                <Button key={item.id} variant="ghost" className="justify-start font-normal">
                  <Link to={item.path} className="flex items-center" onClick={() => setOpen(false)}>
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              ))}
            </>
          )}
          
          <DebugButton
            onClick={handleDebugClick}
            className="justify-start font-normal border-t pt-4 mt-4"
            variant="ghost"
          >
            Open Diagnostics
          </DebugButton>
          
          <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
