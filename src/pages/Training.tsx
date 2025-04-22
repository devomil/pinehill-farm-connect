
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, CheckCircle, Clock, FileText, Play, Award } from "lucide-react";
import { Training, TrainingProgress } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TrainingPortal() {
  const { currentUser } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch trainings
        let { data: trainingData, error: trainingError } = await supabase
          .from("trainings")
          .select("*");

        if (trainingError) throw trainingError;
        
        // For assigned trainings, we would fetch from training_assignments
        // But for demo, we'll use mock progress data
        const mockProgress: TrainingProgress[] = [
          {
            userId: currentUser?.id || "",
            trainingId: trainingData?.[0]?.id || "",
            completed: true,
            completedDate: new Date("2023-03-15"),
            score: 95,
          }
        ];

        setTrainings(trainingData as Training[]);
        setTrainingProgress(mockProgress);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load training data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const getUserProgress = (trainingId: string) => {
    return trainingProgress.find(p => p.trainingId === trainingId && p.userId === currentUser?.id);
  };

  const getTotalProgress = () => {
    if (!trainings.length) return 0;
    const completed = trainingProgress.filter(p => p.completed).length;
    return Math.round((completed / trainings.length) * 100);
  };

  // Group trainings by category
  const trainingsByCategory = trainings.reduce((acc, training) => {
    const category = training.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(training);
    return acc;
  }, {} as Record<string, Training[]>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading trainings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Training Portal</h1>
          <p className="text-muted-foreground">Complete required trainings and track your progress</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Training completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall completion</span>
                <span className="font-medium">{getTotalProgress()}%</span>
              </div>
              <Progress value={getTotalProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Trainings</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-8">
            {Object.entries(trainingsByCategory).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Book className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    No trainings are available for you at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(trainingsByCategory).map(([category, trainings]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-semibold">{category === "OpeningClosing" ? "Opening & Closing" : category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainings.map((training) => {
                      const progress = getUserProgress(training.id);
                      const isCompleted = !!progress?.completed;

                      return (
                        <Card key={training.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{training.title}</CardTitle>
                              {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                            </div>
                            <CardDescription>{training.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-muted-foreground">{training.duration} mins</span>
                              </div>
                              {isCompleted && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Score: {progress?.score}%
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            {isCompleted ? (
                              <Button variant="outline" size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                View Certificate
                              </Button>
                            ) : (
                              <Button variant="default" size="sm" className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Start Training
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="incomplete">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainings
                .filter((training) => !trainingProgress.some(p => p.trainingId === training.id && p.completed))
                .map((training) => (
                  <Card key={training.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{training.title}</CardTitle>
                      <CardDescription>{training.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{training.duration} mins</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="default" size="sm" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {trainings.filter(t => !trainingProgress.some(p => p.trainingId === t.id && p.completed)).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
                  <p className="text-center text-muted-foreground">
                    You've completed all your assigned trainings!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainings
                .filter((training) => trainingProgress.some(p => p.trainingId === training.id && p.completed))
                .map((training) => {
                  const progress = getUserProgress(training.id);
                  
                  return (
                    <Card key={training.id} className="border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{training.title}</CardTitle>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <CardDescription>{training.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-muted-foreground">Completed: {progress?.completedDate?.toLocaleDateString()}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Score: {progress?.score}%
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
            {trainings.filter(t => trainingProgress.some(p => p.trainingId === t.id && p.completed)).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Book className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    You haven't completed any trainings yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
