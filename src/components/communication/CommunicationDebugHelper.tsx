
import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  };
}

export const CommunicationDebugHelper: React.FC<CommunicationDebugHelperProps> = ({
  showDebug,
  activeTab,
  unreadMessages = [],
  onTabChange,
  onRefresh,
  navigationInProgress = false,
  messageTabInfo
}) => {
  const location = useLocation();

  if (!showDebug) return null;

  return (
    <Card className="mt-4 bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Communication Navigation Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
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
        
        {/* Message tab mounting info */}
        {messageTabInfo && (
          <>
            <div className="mt-2 pt-2 border-t">
              <strong>Message Tab Debug:</strong>
            </div>
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
          </>
        )}
        
        {/* Debug buttons */}
        <div className="flex gap-2 mt-2">
          <button
            className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 rounded"
            onClick={() => onTabChange && onTabChange("announcements")}
          >
            Switch to Announcements
          </button>
          <button
            className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 rounded"
            onClick={() => onTabChange && onTabChange("messages")}
          >
            Switch to Messages
          </button>
          <button
            className="px-2 py-1 text-xs bg-destructive/10 hover:bg-destructive/20 rounded"
            onClick={() => onRefresh && onRefresh()}
          >
            Force Refresh
          </button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Navigation history is tracked to ensure proper tab selection based on URL parameters.
        </div>
      </CardContent>
    </Card>
  );
};
