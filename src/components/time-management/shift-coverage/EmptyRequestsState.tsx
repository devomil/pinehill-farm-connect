
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, UserPlus, Users } from "lucide-react";

interface EmptyRequestsStateProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
  onRefresh?: () => void;
  employeeCount?: number;
}

export const EmptyRequestsState: React.FC<EmptyRequestsStateProps> = ({ 
  filter, 
  setFilter, 
  onRefresh,
  employeeCount = 0
}) => {
  // Determine if we should show the no employees message
  const showNoEmployeesMessage = employeeCount === 0;

  return (
    <Card>
      <CardContent className="p-8 text-center">
        {showNoEmployeesMessage ? (
          <>
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No other employees available</h3>
            <p className="text-muted-foreground mb-4">
              There are no other employees in the system to request shift coverage from.
            </p>
          </>
        ) : (
          <>
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shift coverage requests found</h3>
            <p className="text-muted-foreground mb-4">
              {filter !== 'all' ? 
                `You don't have any ${filter} shift coverage requests at the moment.` : 
                "There are currently no shift coverage requests."}
            </p>
          </>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          {filter !== 'all' && (
            <Button variant="outline" onClick={() => setFilter('all')}>
              View all requests
            </Button>
          )}
          {onRefresh && (
            <Button variant="secondary" onClick={onRefresh} className="mt-2 sm:mt-0">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh data
            </Button>
          )}
          {showNoEmployeesMessage && (
            <Button variant="default" className="mt-2 sm:mt-0">
              <UserPlus className="h-4 w-4 mr-2" /> Add employees in system
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
