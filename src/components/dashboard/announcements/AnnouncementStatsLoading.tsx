
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AnnouncementStatsLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-[350px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <Skeleton className="h-4 w-[100px] mr-2" />
          <Skeleton className="h-4 w-[100px] mr-2" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center">
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex items-center">
              <Skeleton className="h-4 w-[50px] mr-2" />
              <Skeleton className="h-4 w-[50px] mr-2" />
              <Skeleton className="h-4 w-[50px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
