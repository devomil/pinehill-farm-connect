
import { NotificationRequest } from "./types.ts";

/**
 * Generates email subject based on notification type
 */
export function generateEmailSubject(
  type: string, 
  priority: string | undefined, 
  employeeName: string, 
  details: any
): string {
  if (type === "report") {
    return `New ${priority} Priority Report from ${employeeName}`;
  } else if (type === "timeoff") {
    return `New Time Off Request from ${employeeName}`;
  } else if (type === "message") {
    const messageType = details?.messageType || "new_message";
    
    if (messageType === "shift_coverage_request") {
      return `Shift Coverage Request from ${employeeName}`;
    } else if (messageType === "shift_coverage_response") {
      const response = details?.response === "accepted" ? "accepted" : "declined";
      return `Shift Coverage ${response === "accepted" ? "Accepted" : "Declined"} by ${employeeName}`;
    } else {
      return `New Message from ${employeeName}`;
    }
  } else {
    return `New Notification from ${employeeName}`;
  }
}

/**
 * Generates email content based on notification type
 */
export function generateEmailContent(
  type: string, 
  priority: string | undefined, 
  employeeName: string, 
  details: any
): string {
  if (type === "report") {
    return `${employeeName} has submitted a new ${priority} priority report that requires your attention.`;
  } else if (type === "timeoff") {
    return `${employeeName} has submitted a new time off request that requires your review.`;
  } else if (type === "message") {
    const messageType = details?.messageType || "new_message";
    
    if (messageType === "shift_coverage_request") {
      return `${employeeName} has requested coverage for a shift and needs your response.`;
    } else if (messageType === "shift_coverage_response") {
      const response = details?.response === "accepted" ? "accepted" : "declined";
      return `${employeeName} has ${response} your request for shift coverage.`;
    } else {
      return `${employeeName} has sent you a new message.`;
    }
  } else {
    return `${employeeName} has sent you a notification that requires your attention.`;
  }
}

/**
 * Formats details as an HTML table
 */
export function formatDetailsAsHtml(details: any): string {
  if (!details) return '';
  
  let detailsHtml = `
    <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border: 1px solid #eee;">
      <h3 style="margin-top: 0;">Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
  `;
  
  for (const [key, value] of Object.entries(details)) {
    // Skip internal fields
    if (key === 'senderEmail' || key === 'messageType') continue;
    
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    detailsHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${formattedKey}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
      </tr>
    `;
  }
  
  detailsHtml += `
      </table>
    </div>
  `;
  
  return detailsHtml;
}

/**
 * Generate plain text version of details
 */
export function formatDetailsAsPlainText(details: any): string {
  if (!details) return '';
  
  return Object.entries(details)
    .filter(([key]) => key !== 'senderEmail' && key !== 'messageType')
    .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
    .join('\n');
}

/**
 * Generate the HTML email template
 */
export function generateHtmlEmail(
  subject: string, 
  adminName: string, 
  content: string, 
  detailsHtml: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header { 
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 10px 20px;
            margin: 20px 0;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${subject}</h2>
        </div>
        <div class="content">
          <p>Hello ${adminName},</p>
          <p>${content}</p>
          
          ${detailsHtml}
          
          <a href="https://pinehillfarm.co/hr" class="button">Log in to review</a>
          
          <p>Thank you,<br>Pine Hill Farm HR System</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Pine Hill Farm HR System.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate the plain text email content
 */
export function generatePlainTextEmail(
  adminName: string, 
  content: string, 
  detailsText: string
): string {
  return `
Hello ${adminName},

${content}

Details:
${detailsText}

Log in to review: https://pinehillfarm.co/hr

Thank you,
Pine Hill Farm HR System

This is an automated message from the Pine Hill Farm HR System.
  `;
}
