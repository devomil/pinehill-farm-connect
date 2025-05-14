import React, { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TeamCalendarEventFormFileFieldProps {
  form: any;
  name: string;
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
}

export const TeamCalendarEventFormFileField: React.FC<TeamCalendarEventFormFileFieldProps> = ({
  form,
  name,
  label,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
  maxSize = 5, // Default 5MB
  required = false,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: File | null) => void) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      onChange(null);
      setFileName("");
      return;
    }
    
    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error("File too large", `File size must be less than ${maxSize}MB`);
      e.target.value = "";
      return;
    }
    
    setFileName(file.name);
    onChange(file);
  };

  const clearFile = (onChange: (value: null) => void) => {
    onChange(null);
    setFileName("");
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="file"
                  accept={accept}
                  onChange={(e) => handleFileChange(e, onChange)}
                  className={cn(
                    "cursor-pointer opacity-0 absolute inset-0 z-10",
                    { "pointer-events-none": !!value }
                  )}
                  {...rest}
                />
                <div className="flex items-center border rounded-md px-3 py-2 text-sm">
                  <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="flex-1 truncate">
                    {fileName || value?.name || "No file selected"}
                  </span>
                </div>
              </div>
              
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => clearFile(onChange)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {!value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.click()}
                >
                  Browse
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
