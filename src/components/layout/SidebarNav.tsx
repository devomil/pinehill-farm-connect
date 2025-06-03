
import React from "react";
import { MainNavItems } from "./sidebar/MainNavItems";
import { CommunicationNavItems } from "./sidebar/CommunicationNavItems";
import { ToolsNavItems } from "./sidebar/ToolsNavItems";
import { SectionHeader } from "./sidebar/SectionHeader";

interface SidebarNavProps {
  collapsed: boolean;
}

export const SidebarNav = ({ collapsed }: SidebarNavProps) => {
  return (
    <nav className="flex flex-col gap-1 pl-0 pr-1">
      {/* Main navigation group */}
      <div className="mb-2">
        <MainNavItems collapsed={collapsed} />
      </div>
      
      {/* Communication group with separator */}
      <div className="mb-2">
        <SectionHeader title="COMMUNICATION" collapsed={collapsed} />
        <CommunicationNavItems collapsed={collapsed} />
      </div>

      {/* Tools group with separator */}
      <div>
        <SectionHeader title="TOOLS" collapsed={collapsed} />
        <ToolsNavItems collapsed={collapsed} />
      </div>
    </nav>
  );
};
