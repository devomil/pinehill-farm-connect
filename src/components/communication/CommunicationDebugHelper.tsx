
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    circuitBreakerActive?: boolean;
    throttlerStatus?: any;
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
  
  // Auto-expand when there are critical navigation issues
  useEffect(() => {
    if ((navigationDebugInfo?.circuitBreakerActive || navigationDebugInfo?.switchCount > 100) && !expanded) {
      setExpanded(true);
    }
  }, [navigationDebugInfo?.circuitBreakerActive, navigationDebugInfo?.switchCount, expanded]);

  if (!showDebug) return null;

  // Determine severity of navigation issues
  const isCritical = navigationDebugInfo?.circuitBreakerActive || 
    (navigationDebugInfo?.switchCount && navigationDebugInfo.switchCount > 1000);
  
  const hasNavigationIssues = navigationDebugInfo?.loopDetected || 
    (navigationDebugInfo?.switchCount && navigationDebugInfo.switchCount > 10) || 
    (navigationDebugInfo?.timeInTab && navigationDebugInfo.timeInTab < 2000);

  return (
    <Card className={`mt-4 ${isCritical ? 'border-destructive bg-destructive/5' : 'bg-muted/30'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isCritical && <Zap className="h-4 w-4 text-destructive" />}
            {isCritical ? "🚨 CRITICAL: Performance Emergency Detected" : 
             hasNavigationIssues ? "⚠️ Communication Navigation Issues Detected" : 
             "Communication Navigation Debug"}
          </span>
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
        {/* Critical performance alert */}
        {isCritical && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Performance Emergency Detected</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Critical navigation loop detected with {navigationDebugInfo?.switchCount} tab switches!</p>
                {navigationDebugInfo?.circuitBreakerActive && (
                  <p><strong>Circuit breaker is now active</strong> - Navigation is temporarily disabled to protect performance.</p>
                )}
                <p>The system has automatically activated protective measures. Please wait 30 seconds before attempting navigation.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Display any navigation issues prominently */}
        {hasNavigationIssues && !isCritical && (
          <DebugAlert 
            message={navigationDebugInfo?.loopDetected 
              ? "Navigation loop detected! Tab switching rapidly." 
              : "Possible navigation instability detected"
            }
            description={navigationDebugInfo?.switchCount > 10 ? 
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
        
        {/* Circuit breaker status */}
        {navigationDebugInfo?.circuitBreakerActive && (
          <DebugBadge 
            label="Circuit Breaker" 
            value="ACTIVE" 
            variant="destructive"
          />
        )}
        
        <DebugBadge 
          label="Unread Messages" 
          value={unreadMessages.length} 
          variant={unreadMessages.length > 0 ? "destructive" : "outline"}
        />
        
        {/* Performance metrics */}
        {navigationDebugInfo?.switchCount && (
          <DebugBadge 
            label="Tab Switches" 
            value={navigationDebugInfo.switchCount} 
            variant={navigationDebugInfo.switchCount > 100 ? "destructive" : 
                     navigationDebugInfo.switchCount > 10 ? "secondary" : "outline"}
          />
        )}
        
        {/* Navigation stability metrics */}
        {navigationDebugInfo && (
          <NavigationDebugSection 
            navigationDebugInfo={navigationDebugInfo}
            defaultOpen={hasNavigationIssues || isCritical}
          />
        )}
        
        {/* Message tab mounting info */}
        {messageTabInfo && (
          <MessageTabDebugSection 
            messageTabInfo={messageTabInfo}
            activeTab={activeTab}
          />
        )}
        
        {/* Debug actions section with circuit breaker controls */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium mb-2">Debug Actions</div>
          <div className="flex flex-wrap gap-2">
            {navigationDebugInfo?.circuitBreakerActive ? (
              <Button 
                variant="destructive" 
                size="sm"
                className="text-xs h-7"
                disabled
              >
                <Zap className="h-3 w-3 mr-1" /> Circuit Breaker Active
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onRefresh?.()}
                >
                  Manual Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onTabChange?.('announcements')}
                >
                  Go to Announcements
                </Button>
              </>
            )}
          </div>
        </div>
        
        <DebugInfoFooter expanded={expanded} />
      </CardContent>
    </Card>
  );
};
