
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Lock, Unlock, Download, Settings } from "lucide-react";
import { packageProtection, PackageModificationAttempt } from "@/utils/packageProtection";
import { featureFlags } from "@/utils/featureFlags";
import { pluginManager } from "@/utils/pluginManager";

export const PackageProtectionPanel: React.FC = () => {
  const [attempts, setAttempts] = useState<PackageModificationAttempt[]>([]);
  const [permissions, setPermissions] = useState(packageProtection.checkPermissions());
  
  React.useEffect(() => {
    const updateData = () => {
      setAttempts(packageProtection.getAttempts());
      setPermissions(packageProtection.checkPermissions());
    };
    
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportAuditLog = () => {
    const log = packageProtection.exportAuditLog();
    const blob = new Blob([log], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `package-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const PermissionsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {permissions.isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
          Package Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Environment:</span>
          <Badge variant={permissions.environment === 'production' ? 'destructive' : 'default'}>
            {permissions.environment}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Can Modify:</span>
          <Badge variant={permissions.canModify ? 'default' : 'destructive'}>
            {permissions.canModify ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={permissions.isLocked ? 'destructive' : 'default'}>
            {permissions.isLocked ? 'Locked' : 'Unlocked'}
          </Badge>
        </div>
        {permissions.reason && (
          <div className="text-sm text-muted-foreground">
            {permissions.reason}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AuditLogCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Modification Attempts ({attempts.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAuditLog}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Log
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modification attempts logged</p>
          ) : (
            attempts.slice(-10).reverse().map((attempt, index) => (
              <div key={index} className="border rounded p-2 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{attempt.action}</span>
                  <Badge variant={attempt.approved ? 'default' : 'destructive'}>
                    {attempt.approved ? 'Approved' : 'Blocked'}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  <div>Source: {attempt.source}</div>
                  <div>Time: {attempt.timestamp.toLocaleString()}</div>
                  {attempt.requestedChange && (
                    <div>Change: {attempt.requestedChange}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const FeatureFlagsCard = () => {
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

  const PluginsCard = () => {
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

  return (
    <div className="space-y-6">
      <PermissionsCard />
      
      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit">
          <AuditLogCard />
        </TabsContent>
        
        <TabsContent value="features">
          <FeatureFlagsCard />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
