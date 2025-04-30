import React, { useEffect, useState } from 'react';
import { useTrainings } from '@/hooks/useTrainings';
import { Button } from "@/components/ui/button";
import { Loading } from '../ui/loading'; // Create this component if it doesn't exist

export const AdminTrainingAssignments = () => {
  const { trainings, isLoading, error } = useTrainings();
  // Rename loading to isLoading to match the property name

  useEffect(() => {
    if (error) {
      console.error("Error loading trainings:", error);
    }
  }, [error]);

  if (isLoading) {
    return <div>Loading training assignments...</div>;
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

// Create a Loading component if it doesn't exist
export const Loading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
