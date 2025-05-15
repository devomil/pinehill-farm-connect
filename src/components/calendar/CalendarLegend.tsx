
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";

export const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-3 mt-3 text-xs p-2 border rounded-md bg-gray-50">
      <div className="flex items-center">
        <Badge variant="outline" className="bg-blue-100 mr-1 h-4 w-4 p-0 flex items-center justify-center">
          <Calendar className="h-2 w-2" />
        </Badge>
        <span>Time Off</span>
      </div>
      <div className="flex items-center">
        <Badge variant="outline" className="bg-green-100 mr-1 h-4 w-4 p-0 flex items-center justify-center">
          <Clock className="h-2 w-2" />
        </Badge>
        <span>Shift</span>
      </div>
      <div className="flex items-center">
        <Badge variant="outline" className="bg-amber-100 mr-1 h-4 w-4 p-0 flex items-center justify-center">
          <User className="h-2 w-2" />
        </Badge>
        <span>Coverage</span>
      </div>
      <div className="flex items-center">
        <div className="bg-red-50 border border-gray-200 rounded mr-1 h-4 w-4 p-0"></div>
        <span>Day Off</span>
      </div>
    </div>
  );
};
