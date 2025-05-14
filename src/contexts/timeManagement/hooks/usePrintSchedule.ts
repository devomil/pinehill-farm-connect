
import { useCallback } from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { User } from "@/types";
import { createShiftsMap } from "@/components/time-management/work-schedule/employeeScheduleUtils";

export const usePrintSchedule = () => {
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString;
    }
  };

  const printEmployeeSchedule = useCallback((schedule: WorkSchedule | null, employee: User | null) => {
    if (!schedule || !employee) {
      console.error("Cannot print schedule: missing data");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error("Failed to open print window");
      return;
    }

    // Get the month from the schedule
    const month = schedule.month;
    const monthDate = parse(month, "yyyy-MM", new Date());
    const monthName = format(monthDate, "MMMM yyyy");
    
    // Create shifts map for easy access
    const shiftsMap = createShiftsMap(schedule);
    
    // Get all days in the month
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);
    const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Generate schedule HTML
    let scheduleHtml = `
      <html>
        <head>
          <title>${employee.name}'s Schedule - ${monthName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            h2 { color: #444; }
            .month-name { text-align: center; font-size: 1.2em; margin-bottom: 20px; }
            .schedule-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .schedule-table th, .schedule-table td { 
              border: 1px solid #ddd; padding: 8px; text-align: left; 
            }
            .schedule-table th { background-color: #f2f2f2; }
            .day-with-shift { background-color: #f0f7ff; }
            .notes { font-style: italic; color: #666; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.8em; color: #888; }
            @media print {
              body { font-size: 12pt; }
              h1 { font-size: 18pt; }
              .no-print { display: none; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Monthly Work Schedule</h1>
          <div class="month-name">${employee.name} - ${monthName}</div>
          
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Shift Times</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Add each day's schedule
    allDaysInMonth.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const formattedDay = format(day, "EEEE");
      const formattedDate = format(day, "MMM dd, yyyy");
      const shifts = shiftsMap.get(dateStr) || [];
      
      const hasShift = shifts.length > 0;
      const rowClass = hasShift ? 'day-with-shift' : '';
      
      if (hasShift) {
        shifts.forEach((shift, index) => {
          scheduleHtml += `
            <tr class="${rowClass}">
              ${index === 0 ? `<td>${formattedDay}</td>` : '<td></td>'}
              ${index === 0 ? `<td>${formattedDate}</td>` : '<td></td>'}
              <td>${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}</td>
              <td class="notes">${shift.notes || ''}</td>
            </tr>
          `;
        });
      } else {
        scheduleHtml += `
          <tr>
            <td>${formattedDay}</td>
            <td>${formattedDate}</td>
            <td>Off</td>
            <td></td>
          </tr>
        `;
      }
    });
    
    // Complete the HTML
    scheduleHtml += `
            </tbody>
          </table>
          
          <div class="footer">
            Schedule generated on ${format(new Date(), "PPP")} at ${format(new Date(), "p")}
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print();" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
              Print Schedule
            </button>
          </div>
        </body>
      </html>
    `;
    
    // Write to the window and trigger print
    printWindow.document.open();
    printWindow.document.write(scheduleHtml);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.focus();
      }, 500);
    };
  }, []);
  
  return { printEmployeeSchedule };
};
