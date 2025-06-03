
import React from "react";

interface SectionHeaderProps {
  title: string;
  collapsed: boolean;
}

export const SectionHeader = ({ title, collapsed }: SectionHeaderProps) => {
  if (collapsed) return null;
  
  return (
    <div className="pl-1 mb-1">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
    </div>
  );
};
