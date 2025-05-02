
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { User } from "@/types";

interface ConversationHeaderProps {
  selectedEmployee: User;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function ConversationHeader({ selectedEmployee, onBack, onRefresh }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="mr-2 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h3 className="font-medium">{selectedEmployee?.name || 'Unknown Employee'}</h3>
          <p className="text-sm text-muted-foreground">{selectedEmployee?.email}</p>
        </div>
      </div>
      
      {onRefresh && (
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh conversation">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
