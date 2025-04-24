
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AnnouncementStatsLoading = () => (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle>Recent Announcements Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[250px] mb-4">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    </CardContent>
  </Card>
);
