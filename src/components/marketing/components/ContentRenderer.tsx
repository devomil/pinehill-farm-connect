
import React from "react";
import { Image as ImageIcon, Link as LinkIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  url: string;
  created_at: string;
  description?: string;
}

interface ContentRendererProps {
  content: ContentItem;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  const renderContent = () => {
    switch (content.content_type) {
      case 'video':
        return (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video 
              controls 
              className="w-full h-full object-contain"
              src={content.url}
              title={content.title}
              onError={(e) => console.error("Video loading error:", e)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="p-2 bg-muted rounded-lg">
            <audio
              controls
              className="w-full"
              src={content.url}
              title={content.title}
              onError={(e) => console.error("Audio loading error:", e)}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case 'image':
        return (
          <div 
            className="relative rounded-lg overflow-hidden aspect-video cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img 
              src={content.url} 
              alt={content.title}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              onError={(e) => {
                console.error("Image loading error");
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        );
      case 'link':
        return (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{content.title}</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => {
                e.stopPropagation();
                window.open(content.url, '_blank', 'noopener,noreferrer');
              }}
              className="h-8"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return renderContent();
};

export const getContentTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
    case 'audio':
      return <Video className="h-3 w-3" />;
    case 'image':
      return <ImageIcon className="h-3 w-3" />;
    case 'link':
      return <LinkIcon className="h-3 w-3" />;
    default:
      return <Video className="h-3 w-3" />;
  }
};
