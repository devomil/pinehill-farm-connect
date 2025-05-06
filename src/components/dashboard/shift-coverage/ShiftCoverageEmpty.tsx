
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ShiftCoverageEmptyProps {
  onRefresh: () => void;
}

export const ShiftCoverageEmpty: React.FC<ShiftCoverageEmptyProps> = ({ onRefresh }) => {
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p>No pending shift coverage requests</p>
      <Button variant="ghost" size="sm" onClick={onRefresh} className="mt-2">
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh
      </Button>
      <div className="mt-3">
        <Link to="/time?tab=shift-coverage">
          <Button variant="outline" size="sm">
            Create Shift Coverage Request
          </Button>
        </Link>
      </div>
    </div>
  );
};
