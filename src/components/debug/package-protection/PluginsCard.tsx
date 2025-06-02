
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pluginManager } from "@/utils/pluginManager";

export const PluginsCard: React.FC = () => {
  const plugins = pluginManager.listAvailablePlugins();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Plugins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(plugins).map(([key, plugin]) => (
            <div key={key} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">{plugin.name}</div>
                <div className="text-sm text-muted-foreground">{plugin.loadMethod}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={plugin.enabled ? 'default' : 'secondary'}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Badge variant={pluginManager.isPluginLoaded(plugin.name) ? 'default' : 'outline'}>
                  {pluginManager.isPluginLoaded(plugin.name) ? 'Loaded' : 'Not Loaded'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
