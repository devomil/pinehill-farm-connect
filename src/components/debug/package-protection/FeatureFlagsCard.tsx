
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { featureFlags } from "@/utils/featureFlags";

export const FeatureFlagsCard: React.FC = () => {
  const flags = featureFlags.getAllFlags();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(flags).map(([name, config]) => (
            <div key={name} className="flex items-center justify-between p-2 border rounded">
              <span className="font-medium">{name}</span>
              <Badge variant={config.enabled ? 'default' : 'secondary'}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
