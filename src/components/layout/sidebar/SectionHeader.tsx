
import React from "react";

interface SectionHeaderProps {
  title: string;
  collapsed: boolean;
}

export const SectionHeader = ({ title, collapsed }: SectionHeaderProps) => {
  if (collapsed) return null;
  
  return (
    <div className="px-3 mb-1">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
    </div>
  );
};
