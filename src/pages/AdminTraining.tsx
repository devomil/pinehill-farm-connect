
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { AdminTrainingForm } from "@/components/training/AdminTrainingForm";
import { AdminTrainingList } from "@/components/training/AdminTrainingList";
import { AdminTrainingAssignments } from "@/components/training/AdminTrainingAssignments";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useTrainings } from "@/hooks/useTrainings";
import { Training } from "@/types";

export default function AdminTraining() {
  const { currentUser, isAuthenticated } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { trainings = [] } = useTrainings();

  // Function to trigger refresh of the training list
  const refreshTrainings = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  // Function to handle edit training (to be implemented)
  const handleEditTraining = (training: Training) => {
    toast.info(`Edit functionality for "${training.title}" coming soon`);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If not admin, show unauthorized message
  if (currentUser?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
          <p className="text-muted-foreground mt-2">
            You need admin privileges to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Training Management</h1>
            <p className="text-muted-foreground">Create and assign trainings to employees</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Create New Training</Button>
        </div>

        <Tabs defaultValue="trainings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trainings">Training Catalog</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          <TabsContent value="trainings" className="space-y-4">
            <AdminTrainingList 
              key={refreshKey} 
              trainings={trainings}
              onAdd={() => setIsFormOpen(true)}
              onEdit={handleEditTraining}
            />
          </TabsContent>
          <TabsContent value="assignments">
            <AdminTrainingAssignments />
          </TabsContent>
        </Tabs>
      </div>
      
      <AdminTrainingForm 
        open={isFormOpen} 
        setOpen={setIsFormOpen} 
        onTrainingCreated={refreshTrainings} 
        currentUser={currentUser!} 
      />
    </DashboardLayout>
  );
}
