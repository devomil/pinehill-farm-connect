
import React, { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User } from "@/types";

interface EmployeeSelectorProps {
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  allEmployees: User[];
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  selectedUserIds,
  setSelectedUserIds,
  allEmployees
}) => {
  const [filter, setFilter] = useState("");

  const filtered = allEmployees.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) || e.email.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUserIds(
      selectedUserIds.includes(id)
        ? selectedUserIds.filter(x => x !== id)
        : [...selectedUserIds, id]
    );
  };

  return (
    <div>
      <Input
        placeholder="Search employees..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-48 overflow-auto border rounded p-2 flex flex-col gap-1 bg-background">
        {filtered.length > 0 ? filtered.map((user) => (
          <label
            key={user.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
              className="accent-primary"
            />
            <span>{user.name} <span className="ml-1 text-muted-foreground text-xs">({user.email})</span></span>
          </label>
        )) : (
          <div className="text-muted-foreground text-sm py-4 text-center">No results</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {selectedUserIds.map(
          id => {
            const user = allEmployees.find(x => x.id === id);
            return user ? (
              <Badge
                key={id}
                className="rounded-full"
                onClick={() => toggleUser(id)}
                style={{ cursor: "pointer" }}
              >
                {user.name}
              </Badge>
            ) : null;
          }
        )}
      </div>
    </div>
  );
}
