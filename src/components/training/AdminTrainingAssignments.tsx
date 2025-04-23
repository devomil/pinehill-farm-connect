
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useTrainings } from "@/hooks/useTrainings";
import { supabase } from "@/integrations/supabase/client";
import { EmptyTrainingState } from "./EmptyTrainingState";
import { AssignTrainingDialog } from "./AssignTrainingDialog";
import { useAuth } from "@/contexts/AuthContext";

export const AdminTrainingAssignments: React.FC = () => {
  const { currentUser } = useAuth();
  const { trainings, loading: trainingsLoading } = useTrainings();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const { unfilteredEmployees, loading: employeesLoading } = useEmployees();

  const handleAssignTraining = async () => {
    if (!selectedTrainingId || selectedUserIds.length === 0 || !currentUser) {
      toast.error("Please select both a training and employees");
      return;
    }

    try {
      setAssigningLoading(true);
      
      const assignments = selectedUserIds.map(userId => ({
        training_id: selectedTrainingId,
        user_id: userId,
        assigned_by: currentUser.id
      }));
      
      const { error } = await supabase
        .from("training_assignments")
        .insert(assignments);
      
      if (error) {
        if (error.code === '23505') {
          toast("Some employees were already assigned this training");
        } else {
          throw error;
        }
      } else {
        toast.success(`Training assigned to ${selectedUserIds.length} employees`);
      }
      
      setIsAssignDialogOpen(false);
      setSelectedTrainingId("");
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Error assigning training:", err);
      toast.error("Failed to assign training");
    } finally {
      setAssigningLoading(false);
    }
  };

  if (trainingsLoading || employeesLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (trainings.length === 0) {
    return <EmptyTrainingState />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Assign Training</CardTitle>
            <Button size="sm" onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Training
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Assign training courses to individual employees or departments
          </p>
        </CardContent>
      </Card>

      <AssignTrainingDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        trainings={trainings}
        selectedTrainingId={selectedTrainingId}
        setSelectedTrainingId={setSelectedTrainingId}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        unfilteredEmployees={unfilteredEmployees}
        onAssign={handleAssignTraining}
        loading={assigningLoading}
      />
    </div>
  );
};
