
import { useState, useCallback } from "react";

/**
 * Hook to manage schedule printing functionality
 */
export function usePrintSchedule() {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  /**
   * Generate and print a user's schedule for a given period
   */
  const printSchedule = useCallback((data: any, period: string) => {
    setIsPrinting(true);
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Unable to open print window');
        return;
      }
      
      // Generate print content
      const title = `Schedule for ${period}`;
      const content = generatePrintContent(data, title);
      
      // Write content to window and print
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 500);
    } catch (error) {
      console.error('Error printing schedule:', error);
      setIsPrinting(false);
    }
  }, []);
  
  /**
   * Generate HTML content for printing
   */
  const generatePrintContent = (data: any, title: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .no-events { text-align: center; margin: 40px 0; color: #666; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${renderScheduleContent(data)}
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;
  };
  
  /**
   * Render schedule content for printing
   */
  const renderScheduleContent = (data: any) => {
    if (!data || data.length === 0) {
      return `<div class="no-events">No events scheduled for this period</div>`;
    }
    
    // Implement schedule rendering logic here
    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((item: any) => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.type}</td>
              <td>${item.details}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };
  
  /**
   * Format date for printing
   */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };
  
  return {
    isPrinting,
    printSchedule
  };
}
