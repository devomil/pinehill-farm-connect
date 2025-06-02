
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  layout?: "vertical" | "horizontal";
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required,
  children,
  className,
  layout = "vertical"
}) => {
  const isHorizontal = layout === "horizontal";

  return (
    <div className={cn(
      "space-y-2",
      isHorizontal && "grid grid-cols-3 gap-4 items-start",
      className
    )}>
      {(label || description) && (
        <div className={cn(isHorizontal && "space-y-1")}>
          {label && (
            <Label className={cn(
              "text-sm font-medium",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}>
              {label}
            </Label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className={cn(isHorizontal && "col-span-2", "space-y-1")}>
        {children}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};
