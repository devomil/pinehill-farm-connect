
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

interface PermissionsCardProps {
  permissions: {
    canModify: boolean;
    environment: string;
    isLocked: boolean;
    reason?: string;
  };
}

export const PermissionsCard: React.FC<PermissionsCardProps> = ({ permissions }) => {
  return (
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
};
