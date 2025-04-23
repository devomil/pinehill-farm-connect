
import React from "react";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface QuizToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export const QuizToggle: React.FC<QuizToggleProps> = ({
  enabled,
  onToggle,
  disabled
}) => {
  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Quiz</FormLabel>
        <FormDescription>
          Create a quiz based on uploaded training materials
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
      </FormControl>
    </FormItem>
  );
};
