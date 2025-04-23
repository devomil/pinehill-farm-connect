
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { QuizEditor } from "./QuizEditor";
import { QuizToggle } from "./QuizToggle";
import { ExternalTestUrlInput } from "./ExternalTestUrlInput";
import { supabase } from "@/integrations/supabase/client";
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleQuizToggle = (checked: boolean) => {
    setHasQuiz(checked);
    if (checked) {
      setExternalTestUrl("");
    }
  };

  const handleExternalUrlChange = (url: string) => {
    setExternalTestUrl(url);
    if (url) {
      setHasQuiz(false);
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
      <QuizToggle 
        enabled={hasQuiz}
        onToggle={handleQuizToggle}
        disabled={!attachments.length}
      />

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

      <ExternalTestUrlInput 
        value={externalTestUrl}
        onChange={handleExternalUrlChange}
        disabled={hasQuiz}
      />
    </div>
  );
};
