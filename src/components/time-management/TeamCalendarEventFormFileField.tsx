
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";

interface FileFieldProps {
  value: string[];
  onChange: (attachments: string[]) => void;
}

export const TeamCalendarEventFormFileField: React.FC<FileFieldProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);

    const attachments: string[] = [];
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      const file = files[i];
      if (!file.type.match(/image|pdf/)) {
        toast.error("File type must be image or PDF");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {  // Changed to 5MB
        toast.error("File too large (max 5MB)");
        continue;
      }
      const reader = new FileReader();
      // eslint-disable-next-line no-await-in-loop
      attachments.push(await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }));
    }
    setUploading(false);
    onChange((value || []).concat(attachments));
  };

  return (
    <FormItem>
      <FormLabel>Attachments (Images or PDFs, max 2, 5MB each)</FormLabel>
      <FormControl>
        <Input
          type="file"
          multiple
          accept="image/*,application/pdf"
          disabled={uploading}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </FormControl>
      {value && value.length > 0 && (
        <div className="mt-2 space-y-2">
          {value.map((a: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {a.startsWith("data:image") ? (
                <img src={a} alt={`Attachment-${idx}`} className="h-8 w-8 rounded" />
              ) : a.startsWith("data:application/pdf") ? (
                <span className="text-blue-400">PDF document {idx+1}</span>
              ) : (
                <span>Attachment {idx+1}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
};
