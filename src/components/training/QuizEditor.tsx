
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizEditorProps {
  questions: QuizQuestion[];
  onQuestionsChange: (questions: QuizQuestion[]) => void;
  onGenerateQuestions: () => Promise<void>;
  generating: boolean;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  questions,
  onQuestionsChange,
  onGenerateQuestions,
  generating
}) => {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions];
    if (field === "options") {
      const [optionIndex, optionValue] = value as [number, string];
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = value as number;
    } else {
      // @ts-ignore - This is safe since we're checking field is keyof QuizQuestion
      updatedQuestions[index][field] = value;
    }
    onQuestionsChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={addQuestion} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
        <Button 
          onClick={onGenerateQuestions} 
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Questions from Materials"}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                Question {questionIndex + 1}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                  placeholder="Enter question text"
                />
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateQuestion(questionIndex, "options", [optionIndex, e.target.value])}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Select
                        value={question.correctAnswer === optionIndex ? "correct" : "incorrect"}
                        onValueChange={(value) => {
                          if (value === "correct") {
                            updateQuestion(questionIndex, "correctAnswer", optionIndex);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="correct">Correct</SelectItem>
                          <SelectItem value="incorrect">Incorrect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
