
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Loader2, MessageCircle, MessageSquare, RefreshCcw, Search, User as UserIcon } from "lucide-react";
import { Communication } from "@/types/communications/communicationTypes";
import { Badge } from "@/components/ui/badge";

interface EmployeeListProps {
  employees: User[];
  isLoading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessages?: Communication[];
  onRefresh?: () => void;
}

export function EmployeeList({
  employees,
  isLoading,
  onSelectEmployee,
  selectedEmployee,
  searchQuery,
  setSearchQuery,
  unreadMessages = [],
  onRefresh,
}: EmployeeListProps) {
  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Count unread messages per employee
  const getUnreadCount = (employeeId: string): number => {
    return unreadMessages.filter((msg) => msg.sender_id === employeeId).length;
  };

  // Get the most recent unread message from an employee (for preview)
  const getLatestUnreadMessage = (employeeId: string): string | null => {
    const messages = unreadMessages
      .filter(msg => msg.sender_id === employeeId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return messages.length > 0 ? messages[0].message : null;
  };

  // Sort employees: those with unread messages first, then alphabetically
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aUnreadCount = getUnreadCount(a.id);
    const bUnreadCount = getUnreadCount(b.id);
    
    // First sort by unread count (descending)
    if (aUnreadCount !== bUnreadCount) {
      return bUnreadCount - aUnreadCount;
    }
    
    // Then sort alphabetically by name
    return (a.name || "").localeCompare(b.name || "");
  });
  
  // Group employees with unread messages for better visualization
  const employeesWithUnread = sortedEmployees.filter(emp => getUnreadCount(emp.id) > 0);
  const employeesWithoutUnread = sortedEmployees.filter(emp => getUnreadCount(emp.id) === 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            title="Refresh employee list"
            className="flex-shrink-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {unreadMessages.length > 0 && employeesWithUnread.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5 text-primary" /> 
            <span className="text-primary">New Messages</span> 
            <Badge variant="secondary" className="ml-2">{unreadMessages.length}</Badge>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading employees...</span>
        </div>
      ) : sortedEmployees.length > 0 ? (
        <div className="overflow-y-auto flex-1 -mx-4 px-4">
          {/* Employees with unread messages section */}
          {employeesWithUnread.length > 0 && (
            <div className="mb-3">
              <div className="space-y-2">
                {employeesWithUnread.map((employee) => {
                  const unreadCount = getUnreadCount(employee.id);
                  const latestMessage = getLatestUnreadMessage(employee.id);
                  const isActive = selectedEmployee?.id === employee.id;
                  
                  return (
                    <div
                      key={employee.id}
                      onClick={() => onSelectEmployee(employee)}
                      className={`flex flex-col p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                        isActive ? "bg-accent" : ""
                      } border-l-4 border-primary`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground mr-3">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center">
                              {employee.name || "Unknown"}
                              <div className="flex items-center bg-primary text-primary-foreground h-6 min-w-6 px-2 rounded-full text-xs font-medium ml-2">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {unreadCount}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[160px]">
                              {employee.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {latestMessage && (
                        <div className="mt-2 ml-13 pl-12 text-sm bg-muted/30 p-2 rounded">
                          <span className="line-clamp-2">{latestMessage}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {employeesWithoutUnread.length > 0 && (
                <div className="my-3 border-t pt-3">
                  <div className="text-xs uppercase text-muted-foreground font-medium mb-2">
                    Other employees
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Employees without unread messages section */}
          <div className="space-y-2">
            {employeesWithoutUnread.map((employee) => {
              const isActive = selectedEmployee?.id === employee.id;
              
              return (
                <div
                  key={employee.id}
                  onClick={() => onSelectEmployee(employee)}
                  className={`flex flex-col p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                    isActive ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mr-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{employee.name || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[160px]">
                        {employee.email || "No email"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1 text-muted-foreground">
          <UserIcon className="h-10 w-10 mb-3 opacity-20" />
          <p>No employees found</p>
          <p className="text-sm">Try adjusting your search or</p>
          {onRefresh && (
            <Button 
              variant="link" 
              onClick={onRefresh}
              className="mt-1"
            >
              refresh the list
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
