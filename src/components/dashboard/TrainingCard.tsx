
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TrainingCardProps {
  trainings: any[];
  clickable?: boolean;
  viewAllUrl?: string;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ trainings, clickable = false, viewAllUrl }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };

  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Training</CardTitle>
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>Your pending trainings</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {trainings.map((training) => (
            <li key={training.id} className="flex justify-between items-center">
              <span>{training.trainings?.title}</span>
              {training.trainings?.duration && (
                <span className="text-sm text-muted-foreground">
                  {training.trainings.duration} minutes
                </span>
              )}
            </li>
          ))}
        </ul>
        
        {viewAllUrl && (
          <div className="text-center mt-4">
            <Link to={viewAllUrl} onClick={handleButtonClick}>
              <Button variant="link" size="sm">
                View All Trainings
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
