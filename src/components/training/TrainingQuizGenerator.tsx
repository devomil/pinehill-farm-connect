
import React, { useState } from "react";
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface TrainingQuizGeneratorProps {
  hasQuiz: boolean;
  setHasQuiz: (value: boolean) => void;
  attachments: string[];
  externalTestUrl: string;
  setExternalTestUrl: (url: string) => void;
}

export const TrainingQuizGenerator: React.FC<TrainingQuizGeneratorProps> = ({
  hasQuiz,
  setHasQuiz,
  attachments,
  externalTestUrl,
  setExternalTestUrl
}) => {
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const handleExternalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExternalTestUrl(e.target.value);
    if (e.target.value) {
      setHasQuiz(false);
    }
  };

  const handleQuizToggle = (checked: boolean) => {
    setHasQuiz(checked);
    if (checked) {
      setExternalTestUrl("");
    }
  };

  const generateQuiz = async () => {
    if (attachments.length === 0) {
      toast.error("Please upload training materials first");
      return;
    }

    setGeneratingQuiz(true);
    try {
      // In a real implementation, we would call an AI service to analyze the attachments
      // and generate quiz questions. For now, we'll mock this behavior
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock generated questions
      const mockQuestions = [
        {
          question: "What is the primary purpose of this training?",
          options: [
            "To improve employee morale",
            "To ensure compliance with regulations",
            "To reduce operational costs",
            "To increase sales performance"
          ],
          correctAnswer: 1
        },
        {
          question: "According to the training materials, what should you do first in an emergency situation?",
          options: [
            "Call your supervisor",
            "Evacuate the building",
            "Assess the situation safely",
            "Document the incident"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the recommended frequency for reviewing these procedures?",
          options: [
            "Monthly",
            "Quarterly",
            "Annually",
            "Bi-annually"
          ],
          correctAnswer: 2
        }
      ];

      setQuizQuestions(mockQuestions);
      toast.success("Quiz generated successfully! Please review the questions.");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz questions");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Auto-generated Quiz</FormLabel>
          <FormDescription>
            Create a quiz based on uploaded training materials
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={hasQuiz}
            onCheckedChange={handleQuizToggle}
            disabled={!attachments.length}
          />
        </FormControl>
      </FormItem>

      {hasQuiz && (
        <div className="space-y-4">
          <Button 
            type="button" 
            onClick={generateQuiz} 
            disabled={generatingQuiz || attachments.length === 0}
          >
            {generatingQuiz ? "Generating..." : "Generate Quiz Questions"}
          </Button>

          {quizQuestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Generated Questions (Review & Edit)</h4>
              {quizQuestions.map((q, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea defaultValue={q.question} className="min-h-0" />
                    <div className="space-y-2">
                      {q.options.map((option: string, oidx: number) => (
                        <div key={oidx} className="flex items-center gap-2">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${oidx === q.correctAnswer ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                            {String.fromCharCode(65 + oidx)}
                          </div>
                          <Input defaultValue={option} className="flex-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Separator />

      <FormItem>
        <FormLabel>External Testing URL (Optional)</FormLabel>
        <FormDescription>
          Alternatively, provide a URL to external testing platform
        </FormDescription>
        <FormControl>
          <Input 
            type="url" 
            placeholder="https://example.com/test" 
            value={externalTestUrl}
            onChange={handleExternalUrlChange}
            disabled={hasQuiz}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </div>
  );
};
