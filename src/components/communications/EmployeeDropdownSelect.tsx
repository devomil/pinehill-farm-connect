
import React from "react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { MessageCircle, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EmployeeDropdownSelectProps {
  employees: User[];
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessages?: Communication[];
}

export function EmployeeDropdownSelect({
  employees,
  onSelectEmployee,
  selectedEmployee,
  searchQuery,
  setSearchQuery,
  unreadMessages = [],
}: EmployeeDropdownSelectProps) {
  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count unread messages per employee
  const getUnreadCount = (employeeId: string): number => {
    return unreadMessages.filter((msg) => msg.sender_id === employeeId).length;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0 justify-between min-w-[180px]">
              {selectedEmployee ? selectedEmployee.name : "Select Employee"}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px] max-h-[400px] overflow-auto">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                const unreadCount = getUnreadCount(employee.id);
                return (
                  <DropdownMenuItem 
                    key={employee.id}
                    onClick={() => onSelectEmployee(employee)} 
                    className="flex items-center justify-between cursor-pointer py-2"
                  >
                    <div className="flex flex-col">
                      <span>{employee.name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{employee.email}</span>
                    </div>
                    {unreadCount > 0 && (
                      <div className="flex items-center bg-primary text-primary-foreground h-6 min-w-6 px-1.5 rounded-full text-xs font-medium">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {unreadCount}
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                No employees found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedEmployee && (
        <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
          <span className="text-sm font-medium">Currently chatting with:</span>
          <span className="font-semibold">{selectedEmployee.name}</span>
        </div>
      )}
    </div>
  );
}
