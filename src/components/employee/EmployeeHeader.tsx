
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmployeeHeaderProps {
  onAddEmployee: () => void;
}

export function EmployeeHeader({ onAddEmployee }: EmployeeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Employee Management</h1>
      <Button onClick={onAddEmployee} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Employee
      </Button>
    </div>
  );
}
