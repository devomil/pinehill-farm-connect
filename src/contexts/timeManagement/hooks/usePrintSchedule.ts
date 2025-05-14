
import { useCallback } from 'react';
import { WorkSchedule } from '@/types/workSchedule';
import { format } from 'date-fns';

interface PrintOptions {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Hook to handle printing of work schedules
 */
export function usePrintSchedule() {
  /**
   * Formats and prints a work schedule
   * @param schedule - The work schedule to print
   * @param options - Print customization options
   */
  const printSchedule = useCallback((schedule: WorkSchedule | null, options: PrintOptions = {}) => {
    if (!schedule || schedule.shifts.length === 0) {
      console.warn("No schedule data available to print");
      return;
    }
    
    // Prepare print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the schedule');
      return;
    }
    
    // Extract month from schedule data
    const monthYear = schedule.month ? schedule.month : format(new Date(), 'MMMM yyyy');
    
    // Group shifts by date for better presentation
    const shiftsByDate: Record<string, any[]> = {};
    schedule.shifts.forEach(shift => {
      if (!shiftsByDate[shift.date]) {
        shiftsByDate[shift.date] = [];
      }
      shiftsByDate[shift.date].push(shift);
    });
    
    // Create print content with CSS styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Work Schedule - ${monthYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          h1 {
            color: #2563eb;
            margin: 0;
          }
          .date-section {
            margin-bottom: 15px;
          }
          .date-header {
            background-color: #f3f4f6;
            padding: 8px;
            border-radius: 4px;
            font-weight: bold;
          }
          .shift {
            padding: 8px;
            margin: 5px 0;
            border-left: 3px solid #2563eb;
            background-color: #f9fafb;
          }
          .recurring-badge {
            background-color: #dbeafe;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 12px;
            margin-left: 8px;
          }
          .time {
            font-weight: bold;
          }
          .notes {
            font-style: italic;
            color: #666;
            margin-top: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${options.showHeader !== false ? `
        <div class="header">
          <h1>Work Schedule</h1>
          <p>Month: ${monthYear}</p>
        </div>
        ` : ''}
        
        <div class="no-print" style="text-align: center; margin-bottom: 20px;">
          <button onclick="window.print()">Print Schedule</button>
          <button onclick="window.close()">Close</button>
        </div>
        
        ${Object.keys(shiftsByDate)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map(date => {
            const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
            
            return `
              <div class="date-section">
                <div class="date-header">${formattedDate}</div>
                ${shiftsByDate[date].map(shift => `
                  <div class="shift">
                    <span class="time">${shift.startTime.substring(0, 5)} - ${shift.endTime.substring(0, 5)}</span>
                    ${shift.isRecurring ? '<span class="recurring-badge">Recurring</span>' : ''}
                    ${shift.notes ? `<div class="notes">${shift.notes}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
        
        ${options.showFooter !== false ? `
        <div class="footer">
          <p>Printed on ${format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;
    
    // Write to print window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give the browser a moment to render before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }, []);
  
  return { printSchedule };
}
