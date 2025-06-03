
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

interface CommunicationTopNavUserSectionProps {
  onMenuToggle: () => void;
}

export const CommunicationTopNavUserSection: React.FC<CommunicationTopNavUserSectionProps> = ({
  onMenuToggle
}) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      <div className="hidden sm:block text-sm text-gray-700">
        {currentUser?.name}
      </div>
      
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </SheetTrigger>
    </div>
  );
};
