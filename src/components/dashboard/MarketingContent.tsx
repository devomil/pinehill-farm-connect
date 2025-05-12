
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Image, Music, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadMarketingContent } from "@/components/marketing/UploadMarketingContent";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export const MarketingContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: marketingContent, refetch, isLoading, error } = useQuery({
    queryKey: ['marketingContent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
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
          <div className="relative rounded-lg overflow-hidden aspect-video">
            <img 
              src={content.url} 
              alt={content.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image loading error");
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Latest Marketing</CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7"
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            {currentUser?.role === "admin" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-7 px-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
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
      <CardContent className="overflow-auto h-[400px] custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Failed to load content.</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2 text-xs h-8">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : marketingContent?.length ? (
          <div className="space-y-4">
            {marketingContent.map((content) => (
              <div key={content.id} className="space-y-1 border-b pb-4 mb-4 last:border-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {content.content_type === 'video' ? (
                    <Video className="h-3 w-3" />
                  ) : content.content_type === 'audio' ? (
                    <Music className="h-3 w-3" />
                  ) : (
                    <Image className="h-3 w-3" />
                  )}
                  <span className="font-medium">{content.title}</span>
                </div>
                {renderContent(content)}
                {content.description && (
                  <p className="text-xs text-muted-foreground">{content.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No marketing content.</p>
            {currentUser?.role === "admin" && (
              <Button 
                variant="outline" 
                className="mt-2 text-xs h-8"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add First Content
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
