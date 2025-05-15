
import React from "react";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { TrainingEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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

  // Save resize state to localStorage
  const handleResize = (sizes: number[]) => {
    localStorage.setItem('dashboard-training-size', sizes[0].toString());
  };

  // Get saved size from localStorage or use default
  const defaultSize = parseInt(localStorage.getItem('dashboard-training-size') || '100');

  return (
    <>
      <div className="col-span-full">
        <ResizablePanelGroup 
          direction="horizontal"
          onLayout={handleResize}
          className="h-full rounded-lg overflow-hidden"
        >
          <ResizablePanel 
            defaultSize={defaultSize}
            className="h-full rounded-lg overflow-hidden"
            minSize={30}
            maxSize={100}
          >
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {hasTrainings && (
        <div className="col-span-full">
          <DashboardAlert trainingCount={assignedTrainings!.length} />
        </div>
      )}
    </>
  );
};
