
import React from "react";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, eachDayOfInterval, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange } from "lucide-react";

interface DateRangeSelectorProps {
  onDaysSelected: (days: string[]) => void;
  onCancel: () => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onDaysSelected,
  onCancel
}) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5)
  });
  
  const handleApplyRange = () => {
    if (!dateRange?.from) return;
    
    // If only a single date is selected
    if (!dateRange.to) {
      const singleDay = format(dateRange.from, 'yyyy-MM-dd');
      onDaysSelected([singleDay]);
      return;
    }
    
    // Get all days in the range
    const allDays = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
    
    // Format dates as strings
    const dayStrings = allDays.map(day => format(day, 'yyyy-MM-dd'));
    
    // Send back all selected days
    onDaysSelected(dayStrings);
  };
  
  return (
    <Card className="mb-4 border-orange-300 bg-orange-50">
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-medium text-orange-800">Select Date Range</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <CalendarDateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            
            <div className="flex flex-col space-y-2 w-full md:w-auto">
              <div className="text-sm text-orange-700">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      <p><strong>Selected range:</strong></p>
                      <p>{format(dateRange.from, "MMM d, yyyy")} to {format(dateRange.to, "MMM d, yyyy")}</p>
                      <p className="mt-1"><strong>Total days:</strong> {
                        eachDayOfInterval({
                          start: dateRange.from,
                          end: dateRange.to
                        }).length
                      }</p>
                    </>
                  ) : (
                    <p><strong>Selected:</strong> {format(dateRange.from, "MMM d, yyyy")}</p>
                  )
                ) : (
                  <p>Please select a date range</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-orange-400 text-orange-700 hover:bg-orange-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyRange}
                  disabled={!dateRange?.from}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Apply Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
