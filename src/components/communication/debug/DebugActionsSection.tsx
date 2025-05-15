
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface DebugActionsSectionProps {
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
}

export const DebugActionsSection: React.FC<DebugActionsSectionProps> = ({
  onTabChange,
  onRefresh
}) => {
  return (
    <Collapsible className="mt-2 pt-2 border-t">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-6 w-full flex justify-between text-xs">
          <span className="font-bold">Debug Actions</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-1 mb-2 text-muted-foreground">
          <p>These buttons help diagnose navigation issues:</p>
          <p>- Switch tabs manually to observe navigation behavior</p>
          <p>- Force refresh to clean state and retry loading</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 rounded"
            onClick={() => onTabChange && onTabChange("announcements")}
          >
            Switch to Announcements
          </Button>
          <Button
            className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 rounded"
            onClick={() => onTabChange && onTabChange("messages")}
          >
            Switch to Messages
          </Button>
          <Button
            className="px-2 py-1 text-xs bg-destructive/10 hover:bg-destructive/20 rounded"
            onClick={() => onRefresh && onRefresh()}
          >
            Force Refresh
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
