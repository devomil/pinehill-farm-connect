
import React from "react";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "../EmptyState";

interface MarketingEmptyStateProps {
  isAdmin?: boolean;
  onAddContent?: () => void;
}

export const MarketingEmptyState: React.FC<MarketingEmptyStateProps> = ({ 
  isAdmin, 
  onAddContent 
}) => {
  return (
    <EmptyState
      message={isAdmin 
        ? "No marketing content has been added" 
        : "No marketing content available"
      }
      icon={<AlertCircle className="h-12 w-12 text-muted-foreground/50" />}
      action={isAdmin && onAddContent ? {
        label: "Add Content",
        onClick: onAddContent
      } : undefined}
    />
  );
};
