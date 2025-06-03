
import React, { useState } from 'react';
import {
  Sheet,
} from '@/components/ui/sheet';
import { CommunicationTopNavBrand } from './nav/CommunicationTopNavBrand';
import { CommunicationTopNavItems } from './nav/CommunicationTopNavItems';
import { CommunicationTopNavUserSection } from './nav/CommunicationTopNavUserSection';
import { CommunicationTopNavMenu } from './nav/CommunicationTopNavMenu';

export const CommunicationTopNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <CommunicationTopNavBrand />
          
          {/* Top Navigation Items - showing main nav items */}
          <CommunicationTopNavItems />
          
          {/* User Info & Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <CommunicationTopNavUserSection onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
            <CommunicationTopNavMenu onClose={handleMenuClose} />
          </Sheet>
        </div>
      </div>
    </div>
  );
};
