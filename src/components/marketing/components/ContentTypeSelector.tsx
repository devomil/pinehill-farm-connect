
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ContentType } from "../utils/uploadUtils";

interface ContentTypeSelectorProps {
  value: ContentType;
  onValueChange: (value: ContentType) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  value,
  onValueChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Content Type</label>
      <Select 
        value={value} 
        onValueChange={(value: ContentType) => onValueChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="image">Image</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="audio">Audio</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
