
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
  
  console.log('SidebarMobileSheet: Starting mobile navigation processing');
  
  // Get all nav items and apply complete processing pipeline
  const allNavItems = getAllNavItems();
  console.log(`SidebarMobileSheet: Retrieved ${allNavItems.length} items from getAllNavItems`);
  
  // Filter by role
  const roleFilteredItems = filterNavItemsByRole(allNavItems, currentUser?.role);
  console.log(`SidebarMobileSheet: After role filtering: ${roleFilteredItems.length} items`);
  
  // Apply complete processing pipeline for ultimate deduplication
  const finalNavigationItems = NavigationService.processNavigationItems(roleFilteredItems);
  console.log(`SidebarMobileSheet: Final items after complete processing: ${finalNavigationItems.length}`);
  
  // Enhanced debugging
  console.log('SidebarMobileSheet: Final navigation items:');
  finalNavigationItems.forEach((item, index) => {
    console.log(`  ${index + 1}. [${item.id}] ${item.label} -> ${item.path}`);
  });
  
  // Verification check
  const pathSet = new Set();
  const idSet = new Set();
  finalNavigationItems.forEach(item => {
    const basePath = item.path.split('?')[0].toLowerCase();
    if (pathSet.has(basePath) || idSet.has(item.id)) {
      console.error(`SidebarMobileSheet: CRITICAL DUPLICATE DETECTED: ${item.id} - ${item.path}`);
    }
    pathSet.add(basePath);
    idSet.add(item.id);
  });

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
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the application.
          </SheetDescription>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {finalNavigationItems.map(item => (
            <Button key={item.id} variant="ghost" className="justify-start font-normal">
              <Link to={item.path} className="flex items-center">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
          
          <DebugButton
            onClick={handleDebugClick}
            className="justify-start font-normal"
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
