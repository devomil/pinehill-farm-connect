
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
import { getAllNavItems, filterNavItemsByRole } from "@/config/navConfig";
import { NavigationService } from "@/services/navigationService";
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
  
  // Get all nav items and filter based on user role
  const allNavItems = getAllNavItems();
  const roleFilteredItems = filterNavItemsByRole(allNavItems, currentUser?.role);
  
  // Apply full processing pipeline to ensure no duplicates
  const navigationItems = NavigationService.processNavigationItems(roleFilteredItems);
  
  console.log(`Mobile navigation: Processing ${allNavItems.length} total items, ${roleFilteredItems.length} after role filter, ${navigationItems.length} final items`);

  const handleDebugClick = () => {
    navigate("/diagnostics");
    setOpen(false); // Close the mobile sheet
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
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {navigationItems.map(item => (
            <Button key={item.id} variant="ghost" className="justify-start font-normal">
              <Link to={item.path} className="flex items-center">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          
          {/* Debug Button */}
          <DebugButton
            onClick={handleDebugClick}
            className="justify-start font-normal"
            variant="ghost"
          >
            Open Diagnostics
          </DebugButton>
          
          {/* Logout Button */}
          <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
