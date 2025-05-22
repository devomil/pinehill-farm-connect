
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`flex ${
              i % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                i % 2 === 0 ? "bg-muted" : "bg-primary text-primary-foreground"
              } rounded-lg p-3`}
            >
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-full" />
              <div className="text-xs mt-1 opacity-70">
                <Skeleton className="h-3 w-16 inline-block" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
