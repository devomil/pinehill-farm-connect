
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Users, Award, Pencil, Trash2, AlertCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Training } from "@/types";

export const AdminTrainingList: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });

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

  const handleDeleteTraining = async () => {
    if (!trainingToDelete) return;
    
    try {
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingToDelete);
      
      if (error) throw error;
      
      setTrainings(trainings.filter(t => t.id !== trainingToDelete));
      toast.success("Training deleted successfully");
    } catch (err) {
      console.error("Error deleting training:", err);
      toast.error("Failed to delete training");
    } finally {
      setTrainingToDelete(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "CBD101":
        return <Badge variant="secondary">CBD101</Badge>;
      case "HIPAA":
        return <Badge variant="destructive">HIPAA</Badge>;
      case "SaltGenerator":
        return <Badge variant="outline">Salt Generator</Badge>;
      case "OpeningClosing":
        return <Badge>Opening & Closing</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading trainings...</p>
      </div>
    );
  }

  return (
    <>
      {trainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No trainings found. Click "Create New Training" to add your first training.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => (
            <Card key={training.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    <CardDescription className="mt-1">{training.description}</CardDescription>
                  </div>
                  <div>{getCategoryLabel(training.category || "Other")}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{training.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {training.requiredFor?.includes("all") 
                        ? "Required for all employees" 
                        : `Required for: ${training.requiredFor?.join(", ")}`}
                    </span>
                  </div>
                  {training.expiresAfter && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Expires after {training.expiresAfter} days</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setTrainingToDelete(training.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!trainingToDelete} onOpenChange={() => setTrainingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training? This action cannot be undone and will also remove all associated assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTraining} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
