
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DebugBadge } from "./DebugBadge";

interface MessageTabDebugSectionProps {
  messageTabInfo: {
    currentUrl: string;
    tabParam: string | null;
    mountedAt: number;
    errorState?: string;
    lastDirectoryRefresh?: number;
  };
  activeTab: string;
}

export const MessageTabDebugSection: React.FC<MessageTabDebugSectionProps> = ({
  messageTabInfo,
  activeTab
}) => {
  // Calculate how long the tab has been open
  const timeInTabSeconds = messageTabInfo?.mountedAt 
    ? Math.round((Date.now() - messageTabInfo.mountedAt) / 1000)
    : 0;
    
  // Calculate time since last directory refresh
  const timeSinceLastRefreshSeconds = messageTabInfo?.lastDirectoryRefresh
    ? Math.round((Date.now() - messageTabInfo.lastDirectoryRefresh) / 1000)
    : null;

  return (
    <Collapsible className="mt-2 pt-2 border-t" defaultOpen={messageTabInfo?.errorState === 'error'}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-6 w-full flex justify-between text-xs">
          <span className="font-bold">Message Tab Debug</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <DebugBadge 
          label="Tab Param" 
          value={messageTabInfo.tabParam || "(none)"} 
        />
        <DebugBadge 
          label="Mounted At" 
          value={new Date(messageTabInfo.mountedAt).toLocaleTimeString()} 
        />
        <DebugBadge 
          label="Time Since Mount" 
          value={`${timeInTabSeconds} seconds`}
          condition={timeInTabSeconds < 2}
        />
        {timeSinceLastRefreshSeconds !== null && (
          <DebugBadge 
            label="Directory Refresh" 
            value={`${timeSinceLastRefreshSeconds}s ago`}
            variant={timeSinceLastRefreshSeconds < 10 ? "secondary" : "outline"}
          />
        )}
        {messageTabInfo.errorState && (
          <DebugBadge 
            label="Error State" 
            value={messageTabInfo.errorState}
            variant={messageTabInfo.errorState === 'error' ? "destructive" : "outline"}
          />
        )}
        {activeTab === 'messages' && timeInTabSeconds < 3 && (
          <div className="mt-2 text-amber-600">
            Tab is very recently mounted. It may unmount prematurely if there is a navigation issue.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
