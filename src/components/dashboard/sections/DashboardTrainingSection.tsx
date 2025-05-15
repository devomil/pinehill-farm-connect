
import React from "react";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";

interface DashboardTrainingSectionProps {
  assignedTrainings: any[] | null;
  viewAllUrl?: string;
}

export const DashboardTrainingSection: React.FC<DashboardTrainingSectionProps> = ({
  assignedTrainings,
  viewAllUrl,
}) => {
  if (!assignedTrainings || assignedTrainings.length === 0) return null;

  return (
    <>
      <div className="col-span-full">
        <TrainingCard trainings={assignedTrainings} clickable={true} viewAllUrl={viewAllUrl} />
      </div>
      <div className="col-span-full">
        <DashboardAlert trainingCount={assignedTrainings.length} />
      </div>
    </>
  );
};
