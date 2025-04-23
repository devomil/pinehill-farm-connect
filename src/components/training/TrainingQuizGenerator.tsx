
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { QuizToggle } from "./QuizToggle";
import { ExternalTestUrlInput } from "./ExternalTestUrlInput";
import { QuizManagementSection } from "./QuizManagementSection";
import { QuizQuestion } from "@/types/quiz";

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

  return (
    <div className="space-y-6">
      <QuizToggle 
        enabled={hasQuiz}
        onToggle={handleQuizToggle}
        disabled={!attachments.length}
      />

      {hasQuiz && (
        <QuizManagementSection
          attachments={attachments}
          questions={questions}
          setQuestions={setQuestions}
        />
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
