
import React from "react";
import { cn } from "@/lib/utils";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "responsive";
  padding?: "none" | "sm" | "md" | "lg" | "responsive";
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = "responsive",
  padding = "responsive"
}) => {
  const responsive = useResponsiveLayout();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-none",
    responsive: "max-w-none"
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    responsive: cn(
      "p-4", // mobile
      "sm:p-6", // tablet
      "lg:p-8", // desktop
      responsive.isLargeDesktop && "xl:p-10", // large desktop
      responsive.isExtraLarge && "2xl:p-12" // extra large
    )
  };

  // For responsive maxWidth, use the responsive layout config
  const responsiveMaxWidth = maxWidth === "responsive" 
    ? { maxWidth: responsive.containerMaxWidth }
    : {};

  return (
    <div 
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      style={responsiveMaxWidth}
    >
      {children}
    </div>
  );
};
