
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function EmployeeSearchBar({ query, onQueryChange }: EmployeeSearchBarProps) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search employees by name, email, department..."
        className="pl-10"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  );
}
