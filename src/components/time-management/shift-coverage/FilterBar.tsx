
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  pendingCount,
  acceptedCount,
  declinedCount,
  totalCount
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        size="sm" 
        variant={filter === 'all' ? 'default' : 'outline'} 
        onClick={() => setFilter('all')}
      >
        All Requests ({totalCount})
      </Button>
      <Button 
        size="sm" 
        variant={filter === 'pending' ? 'default' : 'outline'} 
        onClick={() => setFilter('pending')}
        className="relative"
      >
        Pending
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {pendingCount}
          </span>
        )}
      </Button>
      <Button 
        size="sm" 
        variant={filter === 'accepted' ? 'default' : 'outline'} 
        onClick={() => setFilter('accepted')}
        className="relative"
      >
        Accepted
        {acceptedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {acceptedCount}
          </span>
        )}
      </Button>
      <Button 
        size="sm" 
        variant={filter === 'declined' ? 'default' : 'outline'} 
        onClick={() => setFilter('declined')}
        className="relative"
      >
        Declined
        {declinedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {declinedCount}
          </span>
        )}
      </Button>
    </div>
  );
};
