
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ContentRenderer, getContentTypeIcon } from "./ContentRenderer";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  url: string;
  created_at: string;
  description?: string;
}

interface ContentCardProps {
  content: ContentItem;
  onClick?: (content: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  return (
    <Card 
      key={content.id} 
      className="overflow-hidden"
      onClick={() => onClick?.(content)}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getContentTypeIcon(content.content_type)}
            <span className="font-medium line-clamp-1">{content.title}</span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1 h-5">
            {format(new Date(content.created_at), 'MMM d, yyyy')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <ContentRenderer content={content} />
        {content.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{content.description}</p>
        )}
      </CardContent>
    </Card>
  );
};
