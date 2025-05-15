
import React from "react";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { MarketingEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

interface DashboardMarketingSectionProps {
  viewAllUrl?: string;
  className?: string;
  isAdmin?: boolean;
}

export const DashboardMarketingSection: React.FC<DashboardMarketingSectionProps> = ({
  viewAllUrl,
  className,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  
  const handleAddContent = () => {
    navigate("/marketing?action=upload");
  };

  // Check if there is marketing content (this would need to be properly implemented)
  const hasContent = true; // This is a placeholder - you would typically check if there is content

  return (
    <div className="h-full">
      {hasContent ? (
        <MarketingContent 
          clickable={true} 
          viewAllUrl={viewAllUrl} 
          className={className}
        />
      ) : (
        <MarketingEmptyState 
          isAdmin={isAdmin} 
          onAddContent={isAdmin ? handleAddContent : undefined} 
        />
      )}
    </div>
  );
};
