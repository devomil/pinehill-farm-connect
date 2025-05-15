
import React from "react";
import { Badge } from "@/components/ui/badge";

interface DebugBadgeProps {
  label: string;
  value: string | number | boolean;
  variant?: "default" | "secondary" | "destructive" | "outline";
  condition?: boolean;
}

export const DebugBadge: React.FC<DebugBadgeProps> = ({
  label,
  value,
  variant = "outline",
  condition
}) => {
  // If condition is provided, use it to determine variant
  const badgeVariant = condition !== undefined 
    ? (condition ? "secondary" : "outline")
    : variant;

  return (
    <div>
      <strong>{label}:</strong>{" "}
      <Badge variant={badgeVariant} className="ml-2">
        {typeof value === 'boolean' ? (value ? "Yes" : "No") : value}
      </Badge>
    </div>
  );
};
