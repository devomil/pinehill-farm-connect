
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: "default" | "card" | "bordered";
  className?: string;
  headerActions?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  children,
  variant = "default",
  className,
  headerActions
}) => {
  if (variant === "card") {
    return (
      <Card className={className}>
        {(title || description || headerActions) && (
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-4",
            !headerActions && "flex-col items-start space-y-1.5"
          )}>
            <div className="space-y-1">
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  if (variant === "bordered") {
    return (
      <div className={cn("border rounded-lg", className)}>
        {(title || description || headerActions) && (
          <div className={cn(
            "border-b p-4 flex items-center justify-between",
            !headerActions && "flex-col items-start space-y-1"
          )}>
            <div className="space-y-1">
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description || headerActions) && (
        <div className={cn(
          "flex items-center justify-between",
          !headerActions && "flex-col items-start space-y-1"
        )}>
          <div className="space-y-1">
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
