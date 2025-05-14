
import React, { useState, useEffect } from "react";
import { DebugLevel, getDebugLevel, setDebugLevel } from "@/utils/debugUtils";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bug, 
  Search, 
  RefreshCw, 
  Plus, 
  X, 
  Terminal, 
  Clock, 
  AlertCircle 
} from "lucide-react";

// Map debug level to badge variant
const getLevelBadgeVariant = (level: DebugLevel): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case DebugLevel.ERROR:
      return "destructive";
    case DebugLevel.WARN:
      return "default";
    case DebugLevel.INFO:
      return "secondary";
    case DebugLevel.DEBUG:
    case DebugLevel.TRACE:
      return "outline";
    default:
      return "outline";
  }
};

// Map debug level to readable name
const getLevelName = (level: DebugLevel): string => {
  switch (level) {
    case DebugLevel.OFF:
      return "Off";
    case DebugLevel.ERROR:
      return "Error";
    case DebugLevel.WARN:
      return "Warning";
    case DebugLevel.INFO:
      return "Info";
    case DebugLevel.DEBUG:
      return "Debug";
    case DebugLevel.TRACE:
      return "Trace";
    default:
      return "Unknown";
  }
};

interface DebugPanelProps {
  open?: boolean;
  onClose?: () => void;
}

export function DebugPanel({ open = true, onClose }: DebugPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [componentLevels, setComponentLevels] = useState<Record<string, DebugLevel>>({});
  const [newComponent, setNewComponent] = useState("");
  const [newLevel, setNewLevel] = useState<DebugLevel>(DebugLevel.INFO);
  const [consoleEntries, setConsoleEntries] = useState<any[]>([]);

  // Load initial component levels
  useEffect(() => {
    // Get all settings from localStorage
    const savedSettings = localStorage.getItem("debugSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setComponentLevels(parsed);
      } catch (e) {
        console.error("Failed to parse debug settings:", e);
      }
    }
  }, []);

  // Monitor console for new entries
  useEffect(() => {
    if (!open) return;

    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    const captureLog = (
      type: "log" | "info" | "warn" | "error",
      originalFn: (...args: any[]) => void
    ) => {
      return (...args: any[]) => {
        // Call original console method
        originalFn.apply(console, args);

        // Add to our tracked entries
        const timestamp = new Date();
        setConsoleEntries((prev) => [
          { type, args, timestamp },
          ...prev.slice(0, 199), // Keep last 200 entries
        ]);
      };
    };

    // Override console methods
    console.log = captureLog("log", originalConsoleLog);
    console.info = captureLog("info", originalConsoleInfo);
    console.warn = captureLog("warn", originalConsoleWarn);
    console.error = captureLog("error", originalConsoleError);

    // Restore console on cleanup
    return () => {
      console.log = originalConsoleLog;
      console.info = originalConsoleInfo;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, [open]);

  // Handle changing a component's debug level
  const handleLevelChange = (component: string, level: string) => {
    const newLevel = parseInt(level, 10) as DebugLevel;
    setComponentLevels((prev) => ({
      ...prev,
      [component]: newLevel,
    }));
    setDebugLevel(component, newLevel);
  };

  // Handle adding a new component debug entry
  const handleAddComponent = () => {
    if (newComponent.trim()) {
      setComponentLevels((prev) => ({
        ...prev,
        [newComponent]: newLevel,
      }));
      setDebugLevel(newComponent, newLevel);
      setNewComponent("");
    }
  };

  // Handle removing a component debug entry
  const handleRemoveComponent = (component: string) => {
    const updatedLevels = { ...componentLevels };
    delete updatedLevels[component];
    setComponentLevels(updatedLevels);
    
    // Remove from localStorage as well
    const savedSettings = localStorage.getItem("debugSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        delete parsed[component];
        localStorage.setItem("debugSettings", JSON.stringify(parsed));
      } catch (e) {
        console.error("Failed to update debug settings:", e);
      }
    }
  };

  // Filter components by search term
  const filteredComponents = Object.keys(componentLevels)
    .filter((component) =>
      component.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort();

  // Filter console entries
  const filteredConsoleEntries = consoleEntries.filter((entry) => {
    if (!searchTerm) return true;
    // Try to match against stringified args
    return JSON.stringify(entry.args)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  if (!open) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-hidden z-50 shadow-xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Debug Panel
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-4 overflow-auto max-h-[calc(80vh-60px)]">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components or logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="components">
            <AccordionTrigger className="py-2 text-sm">
              Debug Levels
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Component name (e.g., communication.*)"
                    value={newComponent}
                    onChange={(e) => setNewComponent(e.target.value)}
                    className="flex-grow text-sm"
                  />
                  <Select
                    value={newLevel.toString()}
                    onValueChange={(value) => setNewLevel(parseInt(value, 10) as DebugLevel)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DebugLevel.OFF.toString()}>Off</SelectItem>
                      <SelectItem value={DebugLevel.ERROR.toString()}>Error</SelectItem>
                      <SelectItem value={DebugLevel.WARN.toString()}>Warn</SelectItem>
                      <SelectItem value={DebugLevel.INFO.toString()}>Info</SelectItem>
                      <SelectItem value={DebugLevel.DEBUG.toString()}>Debug</SelectItem>
                      <SelectItem value={DebugLevel.TRACE.toString()}>Trace</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddComponent}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1 max-h-40 overflow-auto">
                  {filteredComponents.length === 0 ? (
                    <div className="text-center py-2 text-muted-foreground text-sm">
                      No components found
                    </div>
                  ) : (
                    filteredComponents.map((component) => (
                      <div
                        key={component}
                        className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
                      >
                        <div className="text-sm truncate max-w-[180px]" title={component}>
                          {component}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelBadgeVariant(componentLevels[component])}>
                            {getLevelName(componentLevels[component])}
                          </Badge>
                          <Select
                            value={componentLevels[component].toString()}
                            onValueChange={(value) =>
                              handleLevelChange(component, value)
                            }
                          >
                            <SelectTrigger className="h-7 w-[70px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={DebugLevel.OFF.toString()}>Off</SelectItem>
                              <SelectItem value={DebugLevel.ERROR.toString()}>Error</SelectItem>
                              <SelectItem value={DebugLevel.WARN.toString()}>Warn</SelectItem>
                              <SelectItem value={DebugLevel.INFO.toString()}>Info</SelectItem>
                              <SelectItem value={DebugLevel.DEBUG.toString()}>Debug</SelectItem>
                              <SelectItem value={DebugLevel.TRACE.toString()}>Trace</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveComponent(component)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="console">
            <AccordionTrigger className="py-2 text-sm">
              Console ({filteredConsoleEntries.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    Showing {filteredConsoleEntries.length} entries
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConsoleEntries([])}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>

                <div className="space-y-1 max-h-60 overflow-auto border rounded p-1">
                  {filteredConsoleEntries.length === 0 ? (
                    <div className="text-center py-2 text-muted-foreground text-sm">
                      No console entries
                    </div>
                  ) : (
                    filteredConsoleEntries.map((entry, index) => {
                      let icon;
                      let textClass = '';
                      
                      switch (entry.type) {
                        case 'error':
                          icon = <AlertCircle className="h-3 w-3 text-destructive" />;
                          textClass = 'text-destructive';
                          break;
                        case 'warn':
                          icon = <AlertCircle className="h-3 w-3 text-amber-500" />;
                          textClass = 'text-amber-500';
                          break;
                        case 'info':
                          icon = <Terminal className="h-3 w-3 text-blue-500" />;
                          textClass = 'text-blue-500';
                          break;
                        default:
                          icon = <Terminal className="h-3 w-3 text-muted-foreground" />;
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`text-xs p-1 border-b last:border-0 flex items-start gap-1 ${textClass}`}
                        >
                          <div className="pt-0.5">{icon}</div>
                          <div className="flex-1 truncate">
                            {entry.args.map((arg: any, i: number) => (
                              <span key={i} className="mr-1">
                                {typeof arg === 'object'
                                  ? JSON.stringify(arg).substring(0, 100)
                                  : String(arg).substring(0, 100)}
                                {String(arg).length > 100 ? '...' : ''}
                              </span>
                            ))}
                          </div>
                          <div className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center">
                            <Clock className="h-2 w-2 mr-1" />
                            {entry.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
