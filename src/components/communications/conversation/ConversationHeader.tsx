
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { User } from "@/types";

interface ConversationHeaderProps {
  selectedEmployee: User;
  onBack: () => void;
}

export function ConversationHeader({ selectedEmployee, onBack }: ConversationHeaderProps) {
  return (
    <div className="p-3 border-b flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="mr-2 md:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h3 className="font-medium">{selectedEmployee.name}</h3>
        <p className="text-xs text-muted-foreground">{selectedEmployee.email}</p>
      </div>
    </div>
  );
}
