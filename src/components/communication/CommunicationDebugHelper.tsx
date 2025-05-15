
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { 
  DebugAlert,
  DebugBadge,
  NavigationDebugSection,
  MessageTabDebugSection,
  DebugActionsSection,
  DebugInfoFooter
} from "./debug";

interface CommunicationDebugHelperProps {
  showDebug: boolean;
  activeTab: string;
  unreadMessages?: any[];
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  navigationInProgress?: boolean;
  messageTabInfo?: {
    currentUrl: string;
    tabParam: string | null;
    mountedAt: number;
    errorState?: string;
  };
  navigationDebugInfo?: {
    switchCount: number;
    timeInTab: number;
    loopDetected: boolean;
  };
}

export const CommunicationDebugHelper: React.FC<CommunicationDebugHelperProps> = ({
  showDebug,
  activeTab,
  unreadMessages = [],
  onTabChange,
  onRefresh,
  navigationInProgress = false,
  messageTabInfo,
  navigationDebugInfo
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  
  // Auto-expand when there are navigation issues
  useEffect(() => {
    if (navigationDebugInfo?.loopDetected && !expanded) {
      setExpanded(true);
    }
  }, [navigationDebugInfo?.loopDetected, expanded]);

  if (!showDebug) return null;

  // Determine if there are any navigation issues
  const hasNavigationIssues = navigationDebugInfo?.loopDetected || 
    (navigationDebugInfo?.switchCount && navigationDebugInfo.switchCount > 3) || 
    (navigationDebugInfo?.timeInTab && navigationDebugInfo.timeInTab < 2000);

  return (
    <Card className="mt-4 bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{hasNavigationIssues ? "⚠️ Communication Navigation Issues Detected" : "Communication Navigation Debug"}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)} 
            className="h-6 p-0"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={`text-xs space-y-2 ${expanded ? '' : 'max-h-48 overflow-y-auto'}`}>
        {/* Display any navigation issues prominently */}
        {hasNavigationIssues && (
          <DebugAlert 
            message={navigationDebugInfo?.loopDetected 
              ? "Navigation loop detected! Tab switching rapidly." 
              : "Possible navigation instability detected"
            }
            description={navigationDebugInfo?.switchCount > 3 ? 
              `(${navigationDebugInfo.switchCount} tab switches)` : undefined
            }
          />
        )}
        
        <DebugBadge 
          label="Current Path" 
          value={location.pathname} 
        />
        <DebugBadge 
          label="URL Search" 
          value={location.search || "(none)"} 
        />
        <DebugBadge 
          label="Active Tab" 
          value={activeTab} 
        />
        <DebugBadge 
          label="Navigation In Progress" 
          value={navigationInProgress} 
          variant={navigationInProgress ? "secondary" : "outline"}
        />
        <DebugBadge 
          label="Unread Messages" 
          value={unreadMessages.length} 
          variant={unreadMessages.length > 0 ? "destructive" : "outline"}
        />
        
        {/* Navigation stability metrics */}
        {navigationDebugInfo && (
          <NavigationDebugSection 
            navigationDebugInfo={navigationDebugInfo}
            defaultOpen={hasNavigationIssues}
          />
        )}
        
        {/* Message tab mounting info - expanded with more details */}
        {messageTabInfo && (
          <MessageTabDebugSection 
            messageTabInfo={messageTabInfo}
            activeTab={activeTab}
          />
        )}
        
        {/* Debug actions section */}
        <DebugActionsSection 
          onTabChange={onTabChange}
          onRefresh={onRefresh}
        />
        
        <DebugInfoFooter expanded={expanded} />
      </CardContent>
    </Card>
  );
};
