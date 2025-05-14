
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { UserRound, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

interface AdminEmployeeScheduleCardProps {
  clickable?: boolean;
  viewAllUrl?: string;
  limit?: number;
}

export const AdminEmployeeScheduleCard: React.FC<AdminEmployeeScheduleCardProps> = ({
  clickable = false,
  viewAllUrl,
  limit = 5
}) => {
  const { employees, loading } = useEmployeeDirectory();
  
  const displayEmployees = React.useMemo(() => {
    return (employees || []).slice(0, limit);
  }, [employees, limit]);
  
  const WrapperComponent = clickable && viewAllUrl ? Link : React.Fragment;
  const wrapperProps = clickable && viewAllUrl ? { to: viewAllUrl, className: "block" } : {};
  
  return (
    <Card className={clickable ? "hover:bg-accent/10 transition-colors" : ""}>
      <WrapperComponent {...wrapperProps}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Work Schedules</CardTitle>
          <CardDescription>Manage employee schedules</CardDescription>
        </CardHeader>
      </WrapperComponent>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !employees || employees.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No employees found
          </div>
        ) : (
          <div className="space-y-2">
            {displayEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-3 p-2 bg-accent/20 rounded-md">
                <div className="bg-primary/20 p-1.5 rounded-full">
                  <UserRound className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{employee.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{employee.email}</div>
                </div>
                {viewAllUrl && (
                  <Link 
                    to={`${viewAllUrl}?employee=${employee.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
            
            {employees && employees.length > limit && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                + {employees.length - limit} more employees
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {clickable && viewAllUrl && (
        <CardFooter className="pt-0">
          <Link to={viewAllUrl} className="w-full">
            <Button variant="outline" className="w-full" size="sm">
              Manage Schedules
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
