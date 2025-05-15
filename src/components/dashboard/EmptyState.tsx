
import React from "react";
import { Button } from "@/components/ui/button";
import { EmptyStateProps } from "@/types/dashboard";

/**
 * A reusable empty state component for dashboard widgets
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon,
  action
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
      {icon && (
        <div className="text-4xl mb-3">
          {icon}
        </div>
      )}
      <p className="text-center mb-2">{message}</p>
      {action && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick} 
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
