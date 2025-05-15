import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getContentTypeIcon } from "@/components/marketing/components/ContentRenderer";

interface MarketingContentProps {
  viewAllUrl?: string;
  onViewAllClick?: () => void;
  clickable?: boolean;
}

export const MarketingContent: React.FC<MarketingContentProps> = ({ viewAllUrl, onViewAllClick, clickable = false }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
    
    if (onViewAllClick) {
      onViewAllClick();
    }
  };

  // Fetch the two most recent marketing content items
  const { data: recentContent, isLoading, error } = useQuery({
    queryKey: ['dashboardMarketingContent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000
  });

  const renderContent = (item: any) => {
    switch (item.content_type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            <video 
              src={item.url}
              className="w-full h-full object-contain"
              controls={false}
              muted
              poster="/placeholder.svg"
            />
          </div>
        );
      case 'image':
        return (
          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={item.url} 
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        );
      case 'link':
      case 'audio':
      default:
        return (
          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              {getContentTypeIcon(item.content_type)}
              <span className="text-sm truncate max-w-[120px]">{item.title}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 h-full">
      <h2 className="font-medium text-lg mb-2">Latest Marketing</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="py-6 text-center text-gray-500">
          <p>Failed to load marketing content</p>
        </div>
      ) : recentContent && recentContent.length > 0 ? (
        <div className="space-y-4">
          {recentContent.map((item: any) => (
            <div key={item.id} className="space-y-1">
              {renderContent(item)}
              <div className="flex justify-between items-center px-1 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  {getContentTypeIcon(item.content_type)}
                  <span className="truncate max-w-[150px]">{item.title}</span>
                </div>
                <span className="text-gray-400">
                  {format(new Date(item.created_at), 'MMM d')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500 text-sm">No marketing content available</p>
        </div>
      )}
      
      {viewAllUrl && (
        <div className="text-center mt-4">
          <Link to={viewAllUrl} onClick={handleButtonClick}>
            <Button variant="warning" size="sm">
              View All Marketing
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
