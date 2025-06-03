
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMainNavItems, filterNavItemsByRole } from '@/config/navConfig';
import { useAuth } from '@/contexts/AuthContext';

export const CommunicationTopNavItems: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Get navigation items from centralized config
  const mainNavItems = filterNavItemsByRole(getMainNavItems(), currentUser?.role);

  return (
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
  );
};
