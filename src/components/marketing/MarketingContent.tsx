
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadMarketingContent } from "@/components/marketing/UploadMarketingContent";
import { useAuth } from "@/contexts/AuthContext";
import { ContentGrid } from "@/components/dashboard/marketing/ContentGrid";
import { Lightbox } from "@/components/marketing/Lightbox";
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
      navigate(`/marketing?month=${new Date().toISOString().slice(0, 7)}`);
    }
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
          <ContentGrid
            marketingContent={marketingContent}
            isLoading={isLoading}
            error={error}
            isArchiveView={isArchiveView}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onAddContent={() => setIsDialogOpen(true)}
            canAdd={canAdd}
            currentUserRole={currentUser?.role}
            onImageClick={setSelectedImage}
          />
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
