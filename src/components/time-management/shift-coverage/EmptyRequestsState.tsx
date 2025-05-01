
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface EmptyRequestsStateProps {
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  setFilter: (filter: 'all' | 'pending' | 'accepted' | 'declined') => void;
}

export const EmptyRequestsState: React.FC<EmptyRequestsStateProps> = ({ filter, setFilter }) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No shift coverage requests found</h3>
        <p className="text-muted-foreground mb-4">
          {filter !== 'all' ? 
            `You don't have any ${filter} shift coverage requests at the moment.` : 
            "There are currently no shift coverage requests."}
        </p>
        {filter !== 'all' && (
          <Button variant="outline" onClick={() => setFilter('all')}>
            View all requests
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
