
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ShiftRequestsLoadingState: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Shift Coverage Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-5 w-[180px]" />
                    <Skeleton className="h-4 w-[150px] mt-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[170px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-[80px]" />
                    <Skeleton className="h-9 w-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
