
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Image, Link as LinkIcon, Plus, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadMarketingContent } from "@/components/marketing/UploadMarketingContent";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Lightbox } from "@/components/marketing/Lightbox";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface MarketingContentProps {
  startDate?: Date;
  endDate?: Date;
  isArchiveView?: boolean;
  canAdd?: boolean;
  className?: string;
}

export const MarketingContent: React.FC<MarketingContentProps> = ({
  startDate,
  endDate,
  isArchiveView = false,
  canAdd = false,
  className
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: marketingContent, refetch, isLoading, error } = useQuery({
    queryKey: ['marketingContent', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If date range is provided, filter by created_at
      if (startDate && endDate) {
        query = query.gte('created_at', startDate.toISOString())
                     .lte('created_at', endDate.toISOString());
      }
      
      // If not archive view, just get the latest few items
      if (!isArchiveView) {
        query = query.limit(5);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000
  });

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleUploadComplete = () => {
    refetch();
    setIsDialogOpen(false);
  };

  const handleCardClick = () => {
    if (!isArchiveView) {
      // Navigate to the marketing page with current month
      navigate(`/marketing?month=${format(new Date(), 'yyyy-MM-dd')}`);
    }
  };

  const renderContent = (content: any) => {
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
              setSelectedImage(content.url);
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
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'audio':
        return <Video className="h-3 w-3" />;
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'link':
        return <LinkIcon className="h-3 w-3" />;
      default:
        return <Video className="h-3 w-3" />;
    }
  };

  const renderContentGrid = () => {
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
          <Button variant="outline" onClick={handleRefresh} className="mt-2 text-xs h-8">
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
          
          {(canAdd || currentUser?.role === "admin") && (
            <Button 
              variant="outline" 
              className="mt-2 text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsDialogOpen(true);
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
          <Card key={content.id} className="overflow-hidden">
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
              {renderContent(content)}
              {content.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{content.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Determine if this is on dashboard (not archive view) or a standalone view
  const isDashboard = !isArchiveView;

  return (
    <>
      <Card 
        className={`${isDashboard ? 'h-full flex flex-col cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${className}`}
        onClick={isDashboard ? handleCardClick : undefined}
      >
        <CardHeader className={`${isDashboard ? 'pb-2' : ''}`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              {isDashboard ? "Latest Marketing" : "Marketing Content"}
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }} 
                disabled={isRefreshing || isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {(canAdd || currentUser?.role === "admin") && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Upload Marketing Content</DialogTitle>
                    </DialogHeader>
                    <UploadMarketingContent onUploadComplete={handleUploadComplete} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={isDashboard ? "overflow-auto h-[400px] custom-scrollbar" : ""}>
          {renderContentGrid()}
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      {selectedImage && (
        <Lightbox 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
};
