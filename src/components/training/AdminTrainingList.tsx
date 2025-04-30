
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { Training } from '@/types';
import { toast } from 'sonner';

interface AdminTrainingListProps {
  trainings: Training[];
  onAdd: () => void;
  onEdit: (training: Training) => void;
}

export const AdminTrainingList = ({ trainings, onAdd, onEdit }: AdminTrainingListProps) => {
  // Make sure the trainings are cast to the correct type
  const typedTrainings = trainings.map(training => ({
    ...training,
    category: training.category as "CBD101" | "HIPAA" | "SaltGenerator" | "OpeningClosing" | "Other"
  }));

  const handleDelete = (id: string) => {
    toast.info("Delete functionality coming soon");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Training Modules</CardTitle>
        <Button onClick={onAdd} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Training
        </Button>
      </CardHeader>
      <CardContent>
        {typedTrainings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trainings found. Click "Add New Training" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {typedTrainings.map((training) => (
              <div key={training.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium">{training.title}</h3>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {training.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100">
                      {training.duration} minutes
                    </span>
                    {training.hasQuiz && (
                      <span className="px-2 py-0.5 rounded bg-purple-100">
                        Has Quiz
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(training)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(training.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
