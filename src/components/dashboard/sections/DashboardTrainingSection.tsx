
import React from "react";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { TrainingEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

interface DashboardTrainingSectionProps {
  assignedTrainings: any[] | null;
  viewAllUrl?: string;
  isAdmin?: boolean;
}

export const DashboardTrainingSection: React.FC<DashboardTrainingSectionProps> = ({
  assignedTrainings,
  viewAllUrl,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  
  const handleAddTraining = () => {
    navigate("/training?action=new");
  };

  const hasTrainings = assignedTrainings && assignedTrainings.length > 0;

  return (
    <>
      <div className="col-span-full">
        {hasTrainings ? (
          <TrainingCard 
            trainings={assignedTrainings || []} 
            clickable={true} 
            viewAllUrl={viewAllUrl}
          />
        ) : (
          <TrainingEmptyState 
            isAdmin={isAdmin}
            onAddTraining={isAdmin ? handleAddTraining : undefined}
          />
        )}
      </div>
      {hasTrainings && (
        <div className="col-span-full">
          <DashboardAlert trainingCount={assignedTrainings!.length} />
        </div>
      )}
    </>
  );
};
