
import React, { useState } from 'react';
import { useDebugContext } from '@/contexts/DebugContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bug, 
  X, 
  RefreshCw, 
  Terminal,
  Search,
  Code,
  MessageSquare,
  Database 
} from 'lucide-react';
import { DebugLevel } from '@/utils/debugUtils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

// Interface to safely type performance.memory
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Helper to safely access performance.memory
const getMemoryUsage = (): string => {
  try {
    // Cast performance to any to check for memory property
    const perf = performance as any;
    if (perf && perf.memory) {
      const memory = perf.memory as MemoryInfo;
      return `${Math.round(memory.usedJSHeapSize / (1024 * 1024))} MB`;
    }
  } catch (e) {
    // Silent fail
  }
  return 'Not available';
};

export function DiagnosticsPanel() {
  const { 
    debugMode, 
    setDebugMode, 
    debugComponents, 
    toggleComponentDebug, 
    logLevel, 
    setLogLevel, 
    capturedLogs, 
    clearLogs 
  } = useDebugContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const location = useLocation();

  // Get system info
  const systemInfo = {
    url: location.pathname + location.search,
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  };

  // Get React app info
  const reactInfo = {
    reactVersion: React.version,
    route: location.pathname,
    queryParams: location.search
  };

  // Handle log level change
  const handleLogLevelChange = (level: string) => {
    setLogLevel(parseInt(level, 10) as DebugLevel);
  };

  // Filter logs by component or message content
  const filteredLogs = capturedLogs.filter(log => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      log.component.toLowerCase().includes(searchTerm) ||
      log.message.toLowerCase().includes(searchTerm) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
    );
  });

  // Filter components by name
  const filteredComponents = Object.keys(debugComponents)
    .filter(component => component.toLowerCase().includes(filter.toLowerCase()))
    .sort();

  if (!debugMode) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setDebugMode(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Enable Debug Mode
      </Button>
    );
  }

  if (!isOpen) {
    return (
      <Button 
        variant="default" 
        size="sm" 
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Open Diagnostics
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-hidden z-50 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-sm flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          System Diagnostics
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 space-y-2 overflow-auto max-h-[calc(80vh-70px)]">
        <div className="flex items-center space-x-2 mb-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by component or message..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
            <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
            <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="mt-2 max-h-72 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground">
                {filteredLogs.length} logs captured
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                className="h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
            
            {filteredLogs.length > 0 ? (
              <div className="space-y-1">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="text-xs p-2 bg-muted/30 rounded mb-1">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-1">{log.component}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-medium">{log.message}</div>
                    {log.data && (
                      <pre className="mt-1 text-[10px] bg-muted/60 p-1 rounded overflow-x-auto">
                        {typeof log.data === 'object'
                          ? JSON.stringify(log.data, null, 2)
                          : String(log.data)
                        }
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No logs captured
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="components" className="mt-2">
            <div className="mb-2">
              <Label className="text-xs flex items-center gap-2">
                Log Level
                <select
                  className="text-xs p-1 border rounded bg-transparent"
                  value={logLevel.toString()}
                  onChange={(e) => handleLogLevelChange(e.target.value)}
                >
                  <option value={DebugLevel.OFF.toString()}>Off</option>
                  <option value={DebugLevel.ERROR.toString()}>Error</option>
                  <option value={DebugLevel.WARN.toString()}>Warning</option>
                  <option value={DebugLevel.INFO.toString()}>Info</option>
                  <option value={DebugLevel.DEBUG.toString()}>Debug</option>
                  <option value={DebugLevel.TRACE.toString()}>Trace</option>
                </select>
              </Label>
            </div>
            
            <div className="space-y-1 max-h-60 overflow-auto">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <div
                    key={component}
                    className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                  >
                    <span className="text-xs">{component}</span>
                    <Switch
                      checked={!!debugComponents[component]}
                      onCheckedChange={() => toggleComponentDebug(component)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground text-xs">
                  No components found
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="mt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="system-info">
                <AccordionTrigger className="text-xs py-2">System Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 text-xs">
                    {Object.entries(systemInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border/20 py-1 last:border-0">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="react-info">
                <AccordionTrigger className="text-xs py-2">React Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 text-xs">
                    {Object.entries(reactInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border/20 py-1 last:border-0">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="performance">
                <AccordionTrigger className="text-xs py-2">Performance Metrics</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between border-b border-border/20 py-1">
                      <span className="font-medium">Memory Usage:</span>
                      <span className="text-muted-foreground">
                        {getMemoryUsage()}
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-2">
            <div className="space-y-2">
              <div className="text-xs font-medium">Direct Messages Diagnostics</div>
              
              <div className="p-2 bg-muted/30 rounded text-xs">
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span className="font-medium">Communication Component Status</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Current Route:</span>
                    <Badge variant="outline">{location.pathname}{location.search}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages Tab Active:</span>
                    <Badge variant={location.search.includes('tab=messages') ? 'default' : 'outline'}>
                      {location.search.includes('tab=messages') ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={() => window.location.href = '/communication?tab=messages'}
                >
                  Navigate to Messages Tab
                </Button>
              </div>
            </div>
            
            {/* Additional specialized debugging components would go here */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
