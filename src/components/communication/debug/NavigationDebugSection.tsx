
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DebugBadge } from "./DebugBadge";

interface NavigationDebugSectionProps {
  navigationDebugInfo: {
    switchCount: number;
    timeInTab: number;
    loopDetected: boolean;
  };
  defaultOpen?: boolean;
}

export const NavigationDebugSection: React.FC<NavigationDebugSectionProps> = ({
  navigationDebugInfo,
  defaultOpen = false
}) => {
  const hasNavigationIssues = navigationDebugInfo?.loopDetected || 
    (navigationDebugInfo?.switchCount && navigationDebugInfo.switchCount > 3) || 
    (navigationDebugInfo?.timeInTab && navigationDebugInfo.timeInTab < 2000);

  return (
    <Collapsible className="mt-2 pt-2 border-t" defaultOpen={defaultOpen || hasNavigationIssues}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-6 w-full flex justify-between text-xs">
          <span className="font-bold">Navigation Stability</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <DebugBadge
          label="Tab Switch Count"
          value={navigationDebugInfo.switchCount}
          condition={navigationDebugInfo.switchCount > 3}
        />
        <DebugBadge
          label="Time in Messages Tab"
          value={`${Math.round(navigationDebugInfo.timeInTab / 1000)} seconds`}
          condition={navigationDebugInfo.timeInTab < 2000}
        />
        <DebugBadge
          label="Loop Detected"
          value={navigationDebugInfo.loopDetected}
          variant={navigationDebugInfo.loopDetected ? "destructive" : "outline"}
        />
        {navigationDebugInfo.loopDetected && (
          <div className="mt-2 text-destructive">
            A navigation loop may be preventing you from staying on the messages tab. Try using the "Fix Navigation Loop" button in the navigation bar.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
