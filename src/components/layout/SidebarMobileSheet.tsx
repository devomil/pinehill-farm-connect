
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
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllNavItems, filterNavItemsByRole } from "@/config/navConfig";

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
  
  // Get all nav items and filter based on user role
  const allNavItems = getAllNavItems();
  const visibleItems = filterNavItemsByRole(allNavItems, currentUser?.role);
  
  // Manually ensure no duplicate paths by creating a map with path as key
  const uniqueItemsMap = new Map();
  
  visibleItems.forEach(item => {
    // For items with query params, use the base path as key
    const basePath = item.path.split('?')[0];
    
    // Only add an item if its base path isn't already in the map
    // or if we're adding an item with query params and prefer it
    if (!uniqueItemsMap.has(basePath) || item.path.includes('?')) {
      uniqueItemsMap.set(basePath, item);
    }
  });
  
  // Convert the map back to an array
  const navigationItems = Array.from(uniqueItemsMap.values());

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
          <Button variant="ghost" className="justify-start font-normal" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
