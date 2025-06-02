
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download } from "lucide-react";
import { PackageModificationAttempt } from "@/utils/packageProtection";

interface AuditLogCardProps {
  attempts: PackageModificationAttempt[];
  onExportAuditLog: () => void;
}

export const AuditLogCard: React.FC<AuditLogCardProps> = ({ attempts, onExportAuditLog }) => {
  return (
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
            onClick={onExportAuditLog}
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
};
