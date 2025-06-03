
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const CommunicationTopNavBrand: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="text-xl font-bold text-gray-900">
        Communication
      </div>
      <Badge variant="secondary" className="ml-2 text-xs">
        Full Screen
      </Badge>
    </div>
  );
};
