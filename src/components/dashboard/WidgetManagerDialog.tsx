
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EyeOff, Plus } from "lucide-react";
import { WidgetManagerDialogProps } from "./types/dashboardTypes";

export const WidgetManagerDialog: React.FC<WidgetManagerDialogProps> = ({
  open,
  onOpenChange,
  currentLayout,
  hiddenWidgets,
  toggleWidgetVisibility,
  widgetDefinitions,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Dashboard Widgets</DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="visible">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="visible">
                Visible ({currentLayout.length})
              </TabsTrigger>
              <TabsTrigger value="hidden">
                Hidden ({Object.keys(widgetDefinitions).length - currentLayout.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visible" className="h-[320px] overflow-y-auto">
              <div className="space-y-2">
                {currentLayout.length > 0 ? (
                  currentLayout.map(item => {
                    const widget = widgetDefinitions[item.i];
                    if (!widget) return null;
                    
                    return (
                      <div key={item.i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{widget.title}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWidgetVisibility(item.i)}
                              >
                                <EyeOff className="h-4 w-4" />
                                <span className="sr-only">Hide {widget.title}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Hide from dashboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No visible widgets
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="hidden" className="h-[320px] overflow-y-auto">
              <div className="space-y-2">
                {hiddenWidgets.length > 0 ? (
                  hiddenWidgets.map(id => (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="font-medium">{widgetDefinitions[id].title}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWidgetVisibility(id)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Show {widgetDefinitions[id].title}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add to dashboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No hidden widgets
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="accent">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
