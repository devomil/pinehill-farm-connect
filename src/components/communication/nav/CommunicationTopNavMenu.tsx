
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getAllNavItems, filterNavItemsByRole } from '@/config/navConfig';

interface CommunicationTopNavMenuProps {
  onClose: () => void;
}

export const CommunicationTopNavMenu: React.FC<CommunicationTopNavMenuProps> = ({
  onClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Get all navigation items and filter by role, then deduplicate by ID
  const allNavItems = filterNavItemsByRole(getAllNavItems(), currentUser?.role);
  
  // Group items by section for better organization
  const mainNavItems = allNavItems.filter(item => item.section === 'main');
  const communicationNavItems = allNavItems.filter(item => item.section === 'communication');
  const toolsNavItems = allNavItems.filter(item => item.section === 'tools');

  return (
    <SheetContent side="right" className="w-80">
      <SheetHeader>
        <SheetTitle>Navigation Menu</SheetTitle>
      </SheetHeader>
      
      <div className="mt-6 space-y-4">
        {/* Main Navigation */}
        {mainNavItems.length > 0 && (
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
        )}
        
        {/* Communication */}
        {communicationNavItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Communication</h3>
            <div className="space-y-1">
              {communicationNavItems.map((item) => (
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
        )}
        
        {/* Tools */}
        {toolsNavItems.length > 0 && (
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
        )}
        
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
  );
};
