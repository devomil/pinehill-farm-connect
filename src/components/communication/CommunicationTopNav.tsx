
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getMainNavItems, getToolsNavItems, filterNavItemsByRole } from '@/config/navConfig';

export const CommunicationTopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Get navigation items from centralized config
  const mainNavItems = filterNavItemsByRole(getMainNavItems(), currentUser?.role);
  const toolsNavItems = filterNavItemsByRole(getToolsNavItems(), currentUser?.role);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-900">
              Communication
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              Full Screen
            </Badge>
          </div>
          
          {/* Top Navigation Items - showing main nav items */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Button
                key={item.id}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="flex items-center gap-2"
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </div>
          
          {/* User Info & Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-sm text-gray-700">
              {currentUser?.name}
            </div>
            
            {/* Floating Menu Trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  <span className="hidden sm:inline">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Main Navigation</h3>
                    <div className="space-y-1">
                      {mainNavItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={isActive(item.path) ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleNavigation(item.path)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tools */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Tools</h3>
                    <div className="space-y-1">
                      {toolsNavItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={isActive(item.path) ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleNavigation(item.path)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* User Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm text-gray-600">
                        Signed in as <span className="font-medium">{currentUser?.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="ml-2">Logout</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};
