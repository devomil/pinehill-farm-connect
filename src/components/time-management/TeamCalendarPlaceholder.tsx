
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const TeamCalendarPlaceholder: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Team Calendar</CardTitle>
      <CardDescription>View team availability and scheduled time off</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">Calendar View Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We're working on a visual calendar to help you see team coverage at a glance.
        </p>
      </div>
    </CardContent>
  </Card>
);
