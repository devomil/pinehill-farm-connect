
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface TrainingCardProps {
  trainings: any[];
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ trainings }) => {
  return (
    <Card>
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
      </CardContent>
    </Card>
  );
};
