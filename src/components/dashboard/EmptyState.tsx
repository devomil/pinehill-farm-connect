
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "card" | "inline";
  className?: string;
}

/**
 * A reusable empty state component for dashboard widgets and other components
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message,
  description, 
  icon,
  action,
  variant = "card",
  className
}) => {
  const content = (
    <div className="text-center text-muted-foreground">
      {icon && (
        <div className="flex justify-center mb-3">
          {icon}
        </div>
      )}
      <p className="font-medium">{message}</p>
      {description && (
        <p className="text-sm mt-1">{description}</p>
      )}
      {action && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick} 
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("py-8", className)}>
        {content}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="py-8">
        {content}
      </CardContent>
    </Card>
  );
};
