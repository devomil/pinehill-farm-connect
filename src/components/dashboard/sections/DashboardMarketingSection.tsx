
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

  return (
    <div className="h-full">
      <MarketingContent 
        clickable={true} 
        viewAllUrl={viewAllUrl} 
        className={className}
        emptyState={
          <MarketingEmptyState 
            isAdmin={isAdmin} 
            onAddContent={isAdmin ? handleAddContent : undefined} 
          />
        }
      />
    </div>
  );
};
