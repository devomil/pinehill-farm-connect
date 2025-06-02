
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "pending" | "active" | "inactive";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  variant = "default"
}) => {
  const statusStyles = {
    success: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    pending: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    active: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
  };

  const outlineStyles = {
    success: "border-green-300 text-green-700 hover:bg-green-50",
    warning: "border-yellow-300 text-yellow-700 hover:bg-yellow-50",
    error: "border-red-300 text-red-700 hover:bg-red-50",
    info: "border-blue-300 text-blue-700 hover:bg-blue-50",
    pending: "border-orange-300 text-orange-700 hover:bg-orange-50",
    active: "border-green-300 text-green-700 hover:bg-green-50",
    inactive: "border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "transition-colors",
        variant === "outline" ? outlineStyles[status] : statusStyles[status],
        className
      )}
    >
      {children}
    </Badge>
  );
};
