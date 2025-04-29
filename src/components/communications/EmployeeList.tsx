
import React from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeListProps {
  employees: User[];
  isLoading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessages: any[];
}

export function EmployeeList({
  employees,
  isLoading,
  onSelectEmployee,
  selectedEmployee,
  searchQuery,
  setSearchQuery,
  unreadMessages
}: EmployeeListProps) {
  const { currentUser } = useAuth();
  
  // Filter out the current user and apply search
  const filteredEmployees = employees
    .filter(emp => 
      emp.id !== currentUser?.id && 
      (emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       emp.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Count unread messages per sender
  const unreadCounts: Record<string, number> = {};
  unreadMessages.forEach(msg => {
    if (unreadCounts[msg.sender_id]) {
      unreadCounts[msg.sender_id]++;
    } else {
      unreadCounts[msg.sender_id] = 1;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full mb-4" />
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="text-sm text-muted-foreground flex items-center mb-2">
        <UserCheck className="h-4 w-4 mr-1" />
        <span>{filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'} available</span>
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="space-y-1">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserIcon className="mx-auto h-8 w-8 mb-2" />
              <p>No employees found</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => {
              const isSelected = selectedEmployee?.id === employee.id;
              const hasUnread = unreadCounts[employee.id] > 0;

              return (
                <button
                  key={employee.id}
                  onClick={() => onSelectEmployee(employee)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex justify-between items-center ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : hasUnread
                      ? "bg-muted/80 hover:bg-muted"
                      : "hover:bg-muted"
                  }`}
                >
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className={`text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {employee.email}
                    </div>
                  </div>
                  
                  {hasUnread && !isSelected && (
                    <Badge className="bg-primary text-primary-foreground">
                      {unreadCounts[employee.id]}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
