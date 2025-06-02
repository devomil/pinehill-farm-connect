
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Heading } from "@/components/ui/heading";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MarketingContent } from "@/components/marketing/MarketingContent";
import { format, parseISO, addMonths, subMonths, isAfter, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MarketingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Parse date from URL or use current date
  const currentDate = new Date();
  const initialMonth = searchParams.get('month') 
    ? parseISO(searchParams.get('month') as string) 
    : startOfMonth(currentDate);

  // State for current view month
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(false);
  
  // Update URL when month changes
  useEffect(() => {
    setSearchParams({ month: format(viewMonth, 'yyyy-MM-dd') });
  }, [viewMonth, setSearchParams]);

  // Handle navigation
  const goToPreviousMonth = () => {
    setLoading(true);
    setViewMonth(prev => subMonths(prev, 1));
    setTimeout(() => setLoading(false), 300); // Add a small delay to show loading state
  };

  const goToNextMonth = () => {
    // Don't allow going past current month
    if (!isAfter(addMonths(viewMonth, 1), currentDate)) {
      setLoading(true);
      setViewMonth(prev => addMonths(prev, 1));
      setTimeout(() => setLoading(false), 300);
    }
  };

  // Check if we're at the current month to disable Next button
  const isCurrentMonth = format(viewMonth, 'yyyy-MM') === format(currentDate, 'yyyy-MM');

  // Format month for display 
  const formattedMonth = format(viewMonth, 'MMMM yyyy');

  return (
    <DashboardLayout>
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <Heading 
            title={`Marketing • ${formattedMonth}`}
            description="Browse and view marketing materials by month"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousMonth}
              size="sm"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={goToNextMonth}
              size="sm"
              disabled={isCurrentMonth || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <MarketingContent 
          startDate={startOfMonth(viewMonth)}
          endDate={endOfMonth(viewMonth)}
          isArchiveView={true}
          canAdd={currentUser?.role === "admin"}
        />
      </div>
    </DashboardLayout>
  );
};

export default MarketingPage;
