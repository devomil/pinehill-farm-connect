
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const EmptyTrainingState: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-40">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          No trainings available to assign. Create a training first.
        </p>
      </CardContent>
    </Card>
  );
};
