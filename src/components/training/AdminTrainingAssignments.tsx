
import React, { useEffect } from 'react';
import { useTrainings } from '@/hooks/useTrainings';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Changed from ../ui/loading to ui/skeleton

export const AdminTrainingAssignments = () => {
  const { trainings, isLoading, error } = useTrainings();

  useEffect(() => {
    if (error) {
      console.error("Error loading trainings:", error);
    }
  }, [error]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Training Assignments</h2>
      {trainings.length === 0 ? (
        <div>No trainings available to assign.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {trainings.map(training => (
            <div key={training.id} className="p-4 border rounded-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{training.title}</h3>
                  <p className="text-sm text-gray-500">{training.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create a proper loading component within the same file
const LoadingState = () => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold">Training Assignments</h2>
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 border rounded-md">
          <div className="flex justify-between">
            <div className="space-y-2 w-3/4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
