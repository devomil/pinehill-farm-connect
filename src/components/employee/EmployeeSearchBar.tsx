
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmployeeSearchBar({ value, onChange }: EmployeeSearchBarProps) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search employees by name, email, department..."
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
