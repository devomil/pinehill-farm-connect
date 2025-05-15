
import React from "react";
import { Badge } from "@/components/ui/badge";

export const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 text-xs">
      <div className="flex items-center">
        <Badge variant="outline" className="bg-blue-100 mr-1 h-4 w-4 p-0" />
        <span>Time Off</span>
      </div>
      <div className="flex items-center">
        <Badge variant="outline" className="bg-green-100 mr-1 h-4 w-4 p-0" />
        <span>Shift</span>
      </div>
      <div className="flex items-center">
        <Badge variant="outline" className="bg-amber-100 mr-1 h-4 w-4 p-0" />
        <span>Coverage</span>
      </div>
      <div className="flex items-center">
        <Badge variant="outline" className="bg-red-100 mr-1 h-4 w-4 p-0" />
        <span>Day Off</span>
      </div>
    </div>
  );
};
