
import React, { useState } from "react";
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { QuizEditor } from "./QuizEditor";
import { supabase } from "@/integrations/supabase/client";

interface TrainingQuizGeneratorProps {
  hasQuiz: boolean;
  setHasQuiz: (value: boolean) => void;
  attachments: string[];
  externalTestUrl: string;
  setExternalTestUrl: (url: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const TrainingQuizGenerator: React.FC<TrainingQuizGeneratorProps> = ({
  hasQuiz,
  setHasQuiz,
  attachments,
  externalTestUrl,
  setExternalTestUrl
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

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

  const generateQuestions = async () => {
    if (attachments.length === 0) {
      toast.error("Please upload training materials first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { attachments }
      });

      if (error) throw error;

      setQuestions(data.questions);
      toast.success("Quiz questions generated successfully! Please review them.");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz questions");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Quiz</FormLabel>
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
        <Card className="p-6">
          <QuizEditor
            questions={questions}
            onQuestionsChange={setQuestions}
            onGenerateQuestions={generateQuestions}
            generating={generating}
          />
        </Card>
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
