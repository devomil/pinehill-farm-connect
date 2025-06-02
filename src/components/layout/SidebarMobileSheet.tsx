
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
  
  console.log('SidebarMobileSheet: Rendering mobile navigation');
  
  // Get all nav items - this is where duplicates might be introduced
  const allNavItems = getAllNavItems();
  console.log(`SidebarMobileSheet: Got ${allNavItems.length} items from getAllNavItems`);
  
  // Filter by role first
  const roleFilteredItems = filterNavItemsByRole(allNavItems, currentUser?.role);
  console.log(`SidebarMobileSheet: After role filtering: ${roleFilteredItems.length} items`);
  
  // Apply full processing pipeline to ensure absolutely no duplicates
  const finalNavigationItems = NavigationService.processNavigationItems(roleFilteredItems);
  console.log(`SidebarMobileSheet: Final items after full processing: ${finalNavigationItems.length}`);
  
  // Debug logging for mobile sheet
  console.log('SidebarMobileSheet: Final navigation items:');
  finalNavigationItems.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.label} (${item.id}) -> ${item.path}`);
  });

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
          {finalNavigationItems.map(item => (
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
