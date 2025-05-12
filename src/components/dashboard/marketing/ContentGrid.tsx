
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentCard } from "@/components/marketing/components/ContentCard";
import { Plus, RefreshCw } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  url: string;
  created_at: string;
  description?: string;
}

interface ContentGridProps {
  marketingContent: ContentItem[] | null;
  isLoading: boolean;
  error: Error | null;
  isArchiveView?: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAddContent?: () => void;
  canAdd?: boolean;
  currentUserRole?: string;
  onImageClick?: (url: string) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  marketingContent,
  isLoading,
  error,
  isArchiveView = false,
  onRefresh,
  isRefreshing,
  onAddContent,
  canAdd = false,
  currentUserRole,
  onImageClick,
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 ${isArchiveView ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
        {Array(isArchiveView ? 6 : 3).fill(0).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">Failed to load content.</p>
        <Button variant="outline" onClick={onRefresh} className="mt-2 text-xs h-8">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }
  
  if (!marketingContent?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArchiveView ? (
          <p className="text-sm">No marketing content for this month.</p>
        ) : (
          <p className="text-sm">No marketing content available.</p>
        )}
        
        {(canAdd || currentUserRole === "admin") && (
          <Button 
            variant="outline" 
            className="mt-2 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              onAddContent?.();
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add First Content
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`${isArchiveView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
      {marketingContent.map((content) => (
        <ContentCard 
          key={content.id} 
          content={content} 
          onClick={(content) => {
            if (content.content_type === 'image') {
              onImageClick?.(content.url);
            }
          }}
        />
      ))}
    </div>
  );
};
