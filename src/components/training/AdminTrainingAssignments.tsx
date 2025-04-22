
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Plus } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { User, Training } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmployeeSelector } from "@/components/communication/EmployeeSelector";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const AdminTrainingAssignments: React.FC = () => {
  const { currentUser } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const { unfilteredEmployees, loading: employeesLoading } = useEmployees();

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("title");

      if (error) {
        throw error;
      }

      // Map required_for to requiredFor to match our Training type
      const mappedTrainings = (data || []).map(training => ({
        ...training,
        requiredFor: training.required_for,
        expiresAfter: training.expires_after
      })) as Training[];

      setTrainings(mappedTrainings);
    } catch (err) {
      console.error("Error fetching trainings:", err);
      toast.error("Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleAssignTraining = async () => {
    if (!selectedTrainingId || selectedUserIds.length === 0 || !currentUser) {
      toast.error("Please select both a training and employees");
      return;
    }

    try {
      setAssigningLoading(true);
      
      // Prepare assignments data
      const assignments = selectedUserIds.map(userId => ({
        training_id: selectedTrainingId,
        user_id: userId,
        assigned_by: currentUser.id
      }));
      
      // Insert assignments in batch
      const { error } = await supabase
        .from("training_assignments")
        .insert(assignments);
      
      if (error) {
        // If there's a unique constraint violation, it means some assignments already exist
        if (error.code === '23505') {
          toast.warning("Some employees were already assigned this training");
        } else {
          throw error;
        }
      } else {
        toast.success(`Training assigned to ${selectedUserIds.length} employees`);
      }
      
      // Close dialog and reset selections
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

  if (loading || employeesLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (trainings.length === 0) {
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
  }

  return (
    <>
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

        {/* Assignment table will go here in future iterations */}
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              Assign a training course to one or more employees
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Training</label>
              <Select
                value={selectedTrainingId}
                onValueChange={setSelectedTrainingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a training" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map((training) => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employees</label>
              <EmployeeSelector
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                allEmployees={unfilteredEmployees}
              />
              
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedUserIds.map(userId => {
                    const employee = unfilteredEmployees.find(e => e.id === userId);
                    return employee ? (
                      <Badge key={userId} variant="secondary">
                        {employee.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTraining} 
              disabled={!selectedTrainingId || selectedUserIds.length === 0 || assigningLoading}
            >
              {assigningLoading ? "Assigning..." : "Assign Training"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
