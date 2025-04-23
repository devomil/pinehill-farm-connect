
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Training } from "@/types";

export const AdminTrainingList: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Map database fields to our Training type
      const mappedTrainings = data.map(training => ({
        id: training.id,
        title: training.title,
        description: training.description,
        category: training.category,
        requiredFor: training.required_for,
        duration: training.duration,
        expiresAfter: training.expires_after,
        hasQuiz: training.has_quiz,
        attachments: training.attachments,
        externalTestUrl: training.external_test_url
      })) as Training[];

      setTrainings(mappedTrainings);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      toast.error("Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const formatRequiredFor = (requiredFor: string[]) => {
    if (requiredFor.includes("all")) {
      return "All Employees";
    }
    return requiredFor.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ");
  };

  const renderAttachmentsIndicator = (training: Training) => {
    if (!training.attachments || training.attachments.length === 0) {
      return null;
    }
    
    return (
      <Badge variant="outline" className="ml-2">
        <FileText className="h-3 w-3 mr-1" />
        {training.attachments.length} file{training.attachments.length !== 1 ? 's' : ''}
      </Badge>
    );
  };

  const renderTestingType = (training: Training) => {
    if (training.hasQuiz) {
      return <Badge className="bg-green-500">Auto Quiz</Badge>;
    }
    
    if (training.externalTestUrl) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <LinkIcon className="h-3 w-3" />
          External
        </Badge>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground">Loading trainings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trainings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground">No trainings created yet. Create a new training to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Required For</TableHead>
              <TableHead>Materials & Testing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.map((training) => (
              <TableRow key={training.id}>
                <TableCell className="font-medium">
                  {training.title}
                </TableCell>
                <TableCell>{training.category}</TableCell>
                <TableCell>{training.duration} min</TableCell>
                <TableCell>{formatRequiredFor(training.requiredFor)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {renderAttachmentsIndicator(training)}
                    {renderTestingType(training)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
