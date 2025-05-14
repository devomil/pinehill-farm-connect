
import { useCallback } from 'react';
import { WorkSchedule, WorkShift } from '@/types/workSchedule';
import { format } from 'date-fns';

export function usePrintSchedule() {
  const printSchedule = useCallback((schedule: WorkSchedule | null) => {
    if (!schedule || !schedule.shifts.length) {
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('Failed to open print window. Pop-ups might be blocked.');
      return;
    }

    // Group shifts by date
    const shiftsByDate = schedule.shifts.reduce((acc: Record<string, WorkShift[]>, shift) => {
      if (!acc[shift.date]) {
        acc[shift.date] = [];
      }
      acc[shift.date].push(shift);
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(shiftsByDate).sort();

    // Build HTML content
    let content = `
      <html>
        <head>
          <title>Work Schedule - ${schedule.month}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 30px;
              line-height: 1.5;
            }
            h1 {
              color: #333;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .date-header {
              margin-top: 20px;
              font-weight: bold;
              background-color: #f0f0f0;
              padding: 5px;
            }
            .shift-item {
              margin: 10px 0;
              padding: 10px;
              border-left: 4px solid #4f46e5;
              background-color: #f9fafb;
            }
            .no-print {
              margin-top: 30px;
            }
            @media print {
              .no-print {
                display: none;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Work Schedule - ${format(new Date(schedule.month), 'MMMM yyyy')}</h1>
    `;

    // Add shifts grouped by date
    sortedDates.forEach(dateStr => {
      const formattedDate = format(new Date(dateStr), 'EEEE, MMMM do, yyyy');
      content += `<div class="date-header">${formattedDate}</div>`;
      
      shiftsByDate[dateStr].forEach(shift => {
        content += `
          <div class="shift-item">
            <div><strong>Time:</strong> ${shift.startTime} - ${shift.endTime}</div>
            ${shift.notes ? `<div><strong>Notes:</strong> ${shift.notes}</div>` : ''}
          </div>
        `;
      });
    });

    // Add print button and close
    content += `
          <div class="no-print">
            <button onclick="window.print()">Print Schedule</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;

    // Write to print window and trigger print
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Give the browser a moment to render before printing
    setTimeout(() => {
      printWindow.focus();
      // Uncomment to automatically trigger print dialog
      // printWindow.print();
    }, 300);
  }, []);

  return { printSchedule };
}
