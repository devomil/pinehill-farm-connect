
import React, { useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { MessageCircle, ChevronDown, Search, Bell, Clock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isSameWeek } from "date-fns";

interface EmployeeDropdownSelectProps {
  employees: User[];
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessages?: Communication[];
  recentConversations?: User[];
}

export function EmployeeDropdownSelect({
  employees,
  onSelectEmployee,
  selectedEmployee,
  searchQuery,
  setSearchQuery,
  unreadMessages = [],
  recentConversations = [],
}: EmployeeDropdownSelectProps) {
  // Filter employees based on search query - ensuring case-insensitive search on both name and email
  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Debug effect for searchQuery changes
  useEffect(() => {
    console.log("Search query changed:", searchQuery);
    console.log("Filtered employees count:", filteredEmployees.length);
    console.log("Total employees count:", employees.length);
  }, [searchQuery, filteredEmployees.length, employees.length]);

  // Count unread messages per employee
  const getUnreadCount = (employeeId: string): number => {
    return unreadMessages.filter((msg) => msg.sender_id === employeeId).length;
  };

  // Check if an employee has unread messages
  const hasUnreadMessages = (employee: User): boolean => {
    return getUnreadCount(employee.id) > 0;
  };

  // Get the most recent unread message preview
  const getMessagePreview = (employeeId: string): string | null => {
    const messages = unreadMessages
      .filter(msg => msg.sender_id === employeeId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (messages.length === 0) return null;
    
    const message = messages[0].message;
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  // Check if an employee is in recent conversations
  const isRecentConversation = (employee: User): boolean => {
    return recentConversations.some(recent => recent.id === employee.id);
  };

  // Sort employees - put employees with unread messages first, then recent conversations, then others
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aHasUnread = hasUnreadMessages(a);
    const bHasUnread = hasUnreadMessages(b);
    const aIsRecent = isRecentConversation(a);
    const bIsRecent = isRecentConversation(b);
    
    // Sort by unread status first
    if (aHasUnread && !bHasUnread) return -1;
    if (!aHasUnread && bHasUnread) return 1;
    
    // Then by recent status
    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;
    
    // Then by name
    return (a.name || "").localeCompare(b.name || "");
  });

  // Group employees by unread status for better visualization
  const employeesWithUnread = sortedEmployees.filter(hasUnreadMessages);
  const employeesWithoutUnread = sortedEmployees.filter(e => !hasUnreadMessages(e));
  
  const totalUnreadCount = unreadMessages.length;

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
            <Button variant="outline" className="flex-shrink-0 justify-between min-w-[180px] relative">
              {selectedEmployee ? (
                <span className="truncate max-w-[140px]">{selectedEmployee.name}</span>
              ) : (
                <span>Select Employee</span>
              )}
              
              <div className="flex items-center">
                {totalUnreadCount > 0 && (
                  <Badge variant="destructive" className="mr-1.5 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {totalUnreadCount}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[320px] max-h-[400px] overflow-auto">
            {sortedEmployees.length > 0 ? (
              <>
                {/* Unread messages section */}
                {employeesWithUnread.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-destructive flex items-center">
                      <Bell className="h-3.5 w-3.5 mr-1" /> 
                      New Messages ({employeesWithUnread.length})
                    </div>
                    
                    {employeesWithUnread.map((employee) => {
                      const unreadCount = getUnreadCount(employee.id);
                      const messagePreview = getMessagePreview(employee.id);
                      
                      return (
                        <DropdownMenuItem 
                          key={`unread-${employee.id}`}
                          onClick={() => onSelectEmployee(employee)} 
                          className="flex flex-col cursor-pointer py-2 border-l-4 border-primary px-2"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <div className="flex items-center font-medium">
                                <span>{employee.name || "Unknown"}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{employee.email}</span>
                            </div>
                            {unreadCount > 0 && (
                              <div className="flex items-center bg-primary text-primary-foreground h-6 min-w-6 px-1.5 rounded-full text-xs font-medium">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {unreadCount}
                              </div>
                            )}
                          </div>
                          
                          {messagePreview && (
                            <div className="mt-1 text-xs text-muted-foreground bg-muted/40 p-1.5 rounded w-full">
                              {messagePreview}
                            </div>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                    
                    <div className="border-t my-1"></div>
                  </>
                )}
                
                {/* Recent conversations section */}
                {employeesWithoutUnread.some(e => isRecentConversation(e)) && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 inline mr-1" /> Recent Conversations
                  </div>
                )}
                
                {employeesWithoutUnread.map((employee) => {
                  const isRecent = isRecentConversation(employee);
                  
                  return (
                    <DropdownMenuItem 
                      key={employee.id}
                      onClick={() => onSelectEmployee(employee)} 
                      className={`flex items-center justify-between cursor-pointer py-2 ${
                        isRecent ? "bg-muted/40" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span>{employee.name || "Unknown"}</span>
                          {isRecent && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
                              <Clock className="h-3 w-3 mr-1" />
                              Recent
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{employee.email}</span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </>
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
