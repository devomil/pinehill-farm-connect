
import React from "react";
import { Card } from "@/components/ui/card";
import { QuizEditor } from "./QuizEditor";
import { QuizQuestion } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizManagementSectionProps {
  attachments: string[];
  questions: QuizQuestion[];
  setQuestions: (questions: QuizQuestion[]) => void;
}

export const QuizManagementSection: React.FC<QuizManagementSectionProps> = ({
  attachments,
  questions,
  setQuestions,
}) => {
  const [generating, setGenerating] = React.useState(false);

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

      if (error) {
        console.error("Error generating quiz:", error);
        toast.error("Failed to generate quiz questions. Please try again later.");
        return;
      }

      if (data.error) {
        console.warn("Warning from quiz generator:", data.error);
        if (data.error.includes("quota")) {
          toast.error("API quota exceeded. Using sample questions instead.");
        }
      }

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        toast.success("Quiz questions generated successfully! Please review them.");
      } else {
        toast.error("No questions could be generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz questions");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <QuizEditor
        questions={questions}
        onQuestionsChange={setQuestions}
        onGenerateQuestions={generateQuestions}
        generating={generating}
      />
    </Card>
  );
};
