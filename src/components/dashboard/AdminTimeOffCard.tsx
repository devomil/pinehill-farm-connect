
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface AdminTimeOffCardProps {
  count: number;
}

export const AdminTimeOffCard: React.FC<AdminTimeOffCardProps> = ({ count }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pending Time-Off Requests</p>
              <h3 className="text-2xl font-bold">{count}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
