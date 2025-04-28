
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Image, Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadMarketingContent } from "@/components/marketing/UploadMarketingContent";
import { useAuth } from "@/contexts/AuthContext";

export const MarketingContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { data: marketingContent, refetch } = useQuery({
    queryKey: ['marketingContent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const renderContent = (content: any) => {
    switch (content.content_type) {
      case 'video':
        return (
          <video 
            controls 
            className="w-full rounded-lg"
            src={content.url}
            title={content.title}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio
            controls
            className="w-full mt-2"
            src={content.url}
            title={content.title}
          >
            Your browser does not support the audio tag.
          </audio>
        );
      case 'image':
        return (
          <img 
            src={content.url} 
            alt={content.title}
            className="w-full rounded-lg object-cover"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Latest Marketing Content</CardTitle>
          {currentUser?.role === "admin" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Marketing Content</DialogTitle>
                </DialogHeader>
                <UploadMarketingContent onUploadComplete={refetch} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketingContent?.map((content) => (
            <div key={content.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {content.content_type === 'video' ? (
                  <Video className="h-4 w-4" />
                ) : content.content_type === 'audio' ? (
                  <Music className="h-4 w-4" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                <span>{content.title}</span>
              </div>
              {renderContent(content)}
              {content.description && (
                <p className="text-sm text-muted-foreground">{content.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
