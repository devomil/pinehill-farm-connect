
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  if (!showDebug) return null;

  // Calculate how long the tab has been open (if applicable)
  const timeInTabSeconds = messageTabInfo?.mountedAt 
    ? Math.round((Date.now() - messageTabInfo.mountedAt) / 1000)
    : 0;

  // Determine if there are any navigation issues
  const hasNavigationIssues = navigationDebugInfo?.loopDetected || 
    (navigationDebugInfo?.switchCount && navigationDebugInfo.switchCount > 3) || 
    (navigationDebugInfo?.timeInTab && navigationDebugInfo.timeInTab < 2000);

  return (
    <Card className="mt-4 bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Communication Navigation Debug</span>
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
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            <AlertDescription className="text-xs">
              {navigationDebugInfo?.loopDetected 
                ? "Navigation loop detected! Tab switching rapidly." 
                : "Possible navigation instability detected"}
              {navigationDebugInfo?.switchCount > 3 && 
                ` (${navigationDebugInfo.switchCount} tab switches)`}
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <strong>Current Path:</strong>{" "}
          <Badge variant="outline" className="ml-2 font-mono">
            {location.pathname}
          </Badge>
        </div>
        <div>
          <strong>URL Search:</strong>{" "}
          <Badge variant="outline" className="ml-2 font-mono">
            {location.search || "(none)"}
          </Badge>
        </div>
        <div>
          <strong>Active Tab:</strong>{" "}
          <Badge className="ml-2">{activeTab}</Badge>
        </div>
        <div>
          <strong>Navigation In Progress:</strong>{" "}
          <Badge variant={navigationInProgress ? "secondary" : "outline"} className="ml-2">
            {navigationInProgress ? "Yes" : "No"}
          </Badge>
        </div>
        <div>
          <strong>Unread Messages:</strong>{" "}
          <Badge variant={unreadMessages.length > 0 ? "destructive" : "outline"} className="ml-2">
            {unreadMessages.length}
          </Badge>
        </div>
        
        {/* Navigation stability metrics */}
        {navigationDebugInfo && (
          <Collapsible className="mt-2 pt-2 border-t" defaultOpen={hasNavigationIssues}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-full flex justify-between text-xs">
                <span className="font-bold">Navigation Stability</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div>
                <strong>Tab Switch Count:</strong>{" "}
                <Badge 
                  variant={navigationDebugInfo.switchCount > 3 ? "secondary" : "outline"} 
                  className="ml-2"
                >
                  {navigationDebugInfo.switchCount}
                </Badge>
              </div>
              <div>
                <strong>Time in Messages Tab:</strong>{" "}
                <Badge 
                  variant={navigationDebugInfo.timeInTab < 2000 ? "secondary" : "outline"} 
                  className="ml-2"
                >
                  {Math.round(navigationDebugInfo.timeInTab / 1000)} seconds
                </Badge>
              </div>
              <div>
                <strong>Loop Detected:</strong>{" "}
                <Badge 
                  variant={navigationDebugInfo.loopDetected ? "destructive" : "outline"} 
                  className="ml-2"
                >
                  {navigationDebugInfo.loopDetected ? "Yes" : "No"}
                </Badge>
              </div>
              {navigationDebugInfo.loopDetected && (
                <div className="mt-2 text-destructive">
                  A navigation loop may be preventing you from staying on the messages tab. Try using the "Fix Navigation Loop" button in the navigation bar.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Message tab mounting info - expanded with more details */}
        {messageTabInfo && (
          <Collapsible className="mt-2 pt-2 border-t" defaultOpen={messageTabInfo?.errorState === 'error'}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-full flex justify-between text-xs">
                <span className="font-bold">Message Tab Debug</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div>
                <strong>Tab Param:</strong>{" "}
                <Badge variant="outline" className="ml-2 font-mono">
                  {messageTabInfo.tabParam || "(none)"}
                </Badge>
              </div>
              <div>
                <strong>Mounted At:</strong>{" "}
                <Badge variant="outline" className="ml-2">
                  {new Date(messageTabInfo.mountedAt).toLocaleTimeString()}
                </Badge>
              </div>
              <div>
                <strong>Time Since Mount:</strong>{" "}
                <Badge variant={timeInTabSeconds < 2 ? "secondary" : "outline"} className="ml-2">
                  {timeInTabSeconds} seconds
                </Badge>
              </div>
              {messageTabInfo.errorState && (
                <div>
                  <strong>Error State:</strong>{" "}
                  <Badge variant={messageTabInfo.errorState === 'error' ? "destructive" : "outline"} className="ml-2">
                    {messageTabInfo.errorState}
                  </Badge>
                </div>
              )}
              {activeTab === 'messages' && timeInTabSeconds < 3 && (
                <div className="mt-2 text-amber-600">
                  Tab is very recently mounted. It may unmount prematurely if there is a navigation issue.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Debug buttons with enhanced explanation */}
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
        
        <div className="text-xs text-muted-foreground mt-2">
          {expanded ? (
            <>
              <p>Navigation history is tracked to ensure proper tab selection based on URL parameters.</p>
              <p className="mt-1">If you keep getting kicked out of Messages tab, try these steps:</p>
              <ol className="list-decimal pl-4 mt-1">
                <li>Use the "Fix Navigation Loop" button in the UI</li>
                <li>Try adding "?recovery=true" to the URL</li>
                <li>Check browser console for specific errors</li>
              </ol>
            </>
          ) : (
            "Navigation history is tracked to ensure proper tab selection based on URL parameters."
          )}
        </div>
      </CardContent>
    </Card>
  );
}
