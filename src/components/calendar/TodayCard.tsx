
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export function TodayCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-4">
          No events scheduled for today
        </p>
      </CardContent>
    </Card>
  );
}
