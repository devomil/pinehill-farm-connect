import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MarketingContentProps {
  viewAllUrl?: string;
  onViewAllClick?: () => void;
}

export const MarketingContent: React.FC<MarketingContentProps> = ({ viewAllUrl, onViewAllClick }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
    
    if (onViewAllClick) {
      onViewAllClick();
    }
  };

  // Placeholder component - This would be replaced with actual marketing content
  return (
    <div className="bg-white shadow rounded-lg p-4 h-full">
      <h2 className="font-medium text-lg mb-2">Latest Marketing</h2>
      <div className="space-y-2">
        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500 text-sm">Marketing Content</p>
        </div>
        
        {viewAllUrl && (
          <div className="text-center mt-4">
            <Link to={viewAllUrl} onClick={handleButtonClick}>
              <Button variant="link" size="sm">
                View All Marketing
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
