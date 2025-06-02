
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { packageProtection, PackageModificationAttempt } from "@/utils/packageProtection";
import { PermissionsCard, AuditLogCard, FeatureFlagsCard, PluginsCard } from "./package-protection";

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

  return (
    <div className="space-y-6">
      <PermissionsCard permissions={permissions} />
      
      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit">
          <AuditLogCard attempts={attempts} onExportAuditLog={handleExportAuditLog} />
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
