
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface TeamCalendarEventFormFileFieldProps {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
}

export const TeamCalendarEventFormFileField: React.FC<TeamCalendarEventFormFileFieldProps> = ({
  form,
  name = "attachments",
  label = "Attachments",
}) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast({
        description: `Files must be less than 5MB: ${oversizedFiles.map(f => f.name).join(", ")}`,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    form.setValue(name, files);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, ...field } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
