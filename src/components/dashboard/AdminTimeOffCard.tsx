
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AdminTimeOffCardProps {
  count: number;
  clickable?: boolean;
  viewAllUrl?: string;
}

export const AdminTimeOffCard: React.FC<AdminTimeOffCardProps> = ({ count, clickable = false, viewAllUrl }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card 
        className={`bg-amber-50 ${clickable ? "cursor-pointer hover:bg-amber-100 transition-colors" : ""}`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pending Time-Off Requests</p>
              <h3 className="text-2xl font-bold">{count}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-700" />
            </div>
          </div>
          
          {viewAllUrl && (
            <div className="text-center mt-4">
              <Link to={viewAllUrl} onClick={handleButtonClick}>
                <Button variant="link" size="sm" className="text-amber-700">
                  View All Requests
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
