
import React from "react";
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ExternalTestUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ExternalTestUrlInput: React.FC<ExternalTestUrlInputProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <FormItem>
      <FormLabel>External Testing URL (Optional)</FormLabel>
      <FormDescription>
        Alternatively, provide a URL to external testing platform
      </FormDescription>
      <FormControl>
        <Input 
          type="url" 
          placeholder="https://example.com/test" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
