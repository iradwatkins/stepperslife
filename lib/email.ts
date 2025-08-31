import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface TicketEmailData {
  buyerName: string;
  buyerEmail: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  tickets: Array<{
    ticketId: string;
    ticketNumber: string;
    ticketCode: string;
    ticketType: string;
    qrCodeUrl: string;
    shareUrl: string;
  }>;
  totalAmount: number;
  purchaseId: string;
}

// Email template for ticket purchase confirmation
function generateTicketEmailHTML(data: TicketEmailData): string {
  const ticketsHTML = data.tickets.map(ticket => `
    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">Ticket #${ticket.ticketNumber}</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <p style="margin: 5px 0;"><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${ticket.ticketType}</p>
          <p style="margin: 5px 0;"><strong>ID:</strong> ${ticket.ticketId}</p>
        </div>
        <div style="text-align: center;">
          <img src="${ticket.qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
          <p style="margin: 10px 0 0 0;">
            <a href="${ticket.shareUrl}" style="color: #4F46E5; text-decoration: none;">View Ticket Online →</a>
          </p>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your SteppersLife Tickets</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your tickets are confirmed</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear ${data.buyerName},</p>
        <p>Thank you for purchasing tickets to <strong>${data.eventName}</strong>! Your order has been confirmed and your tickets are ready.</p>
        
        <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 15px 0; color: #4F46E5;">Event Details</h2>
          <p style="margin: 5px 0;"><strong>Event:</strong> ${data.eventName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${data.eventDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${data.eventTime}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${data.eventLocation}</p>
          <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${data.totalAmount.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Purchase ID:</strong> ${data.purchaseId}</p>
        </div>
        
        <h2 style="color: #4F46E5; margin: 30px 0 20px 0;">Your Tickets (${data.tickets.length} Total)</h2>
        ${ticketsHTML}
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">Important Information</h3>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Please arrive 30 minutes before the event starts</li>
            <li>Show your QR code at the entrance for quick check-in</li>
            <li>You can also use the 6-character ticket code for manual entry</li>
            <li>Screenshot or print your tickets for backup</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://stepperslife.com/tickets" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View All My Tickets</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions about your tickets, please contact us at support@stepperslife.com
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          The SteppersLife Team
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          © 2025 SteppersLife. All rights reserved.<br>
          This email was sent to ${data.buyerEmail}
        </p>
      </div>
    </body>
    </html>
  `;
}

// Send ticket purchase confirmation email
export async function sendTicketPurchaseEmail(data: TicketEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate QR codes as data URLs (in production, these would be generated and hosted)
    const enhancedTickets = data.tickets.map(ticket => ({
      ...ticket,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.shareUrl)}`
    }));

    const emailData = {
      ...data,
      tickets: enhancedTickets
    };

    const html = generateTicketEmailHTML(emailData);

    if (!process.env.SENDGRID_API_KEY) {
      // Mock email sending for development
      console.log('📧 Email would be sent to:', data.buyerEmail);
      console.log('Subject: Your SteppersLife Tickets - ' + data.eventName);
      console.log('Tickets:', data.tickets.map(t => t.ticketNumber).join(', '));
      
      // In development, save email content to a file for testing
      if (process.env.NODE_ENV === 'development') {
        const fs = require('fs').promises;
        const path = require('path');
        const emailDir = path.join(process.cwd(), 'test-emails');
        await fs.mkdir(emailDir, { recursive: true });
        const filename = `ticket-${data.purchaseId}-${Date.now()}.html`;
        await fs.writeFile(path.join(emailDir, filename), html);
        console.log(`📝 Test email saved to: test-emails/${filename}`);
      }
      
      return { success: true };
    }

    // Send actual email via SendGrid
    const msg = {
      to: data.buyerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'tickets@stepperslife.com',
      subject: `Your SteppersLife Tickets - ${data.eventName}`,
      html,
    };

    const response = await sgMail.send(msg);

    console.log('✅ Email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Send test email to verify configuration
export async function sendTestEmail(to: string = 'Appvillagellc@gmail.com'): Promise<{ success: boolean; error?: string }> {
  const testData: TicketEmailData = {
    buyerName: 'Test User',
    buyerEmail: to,
    eventName: 'Test Event - Atlanta Salsa Night',
    eventDate: new Date().toLocaleDateString(),
    eventTime: '8:00 PM',
    eventLocation: 'The Grand Ballroom, Atlanta',
    tickets: [
      {
        ticketId: 'TKT-2025-000001',
        ticketNumber: '2025-000001',
        ticketCode: 'ABC123',
        ticketType: 'VIP',
        qrCodeUrl: '',
        shareUrl: 'https://stepperslife.com/ticket/TKT-2025-000001'
      },
      {
        ticketId: 'TKT-2025-000002',
        ticketNumber: '2025-000002',
        ticketCode: 'XYZ789',
        ticketType: 'General Admission',
        qrCodeUrl: '',
        shareUrl: 'https://stepperslife.com/ticket/TKT-2025-000002'
      }
    ],
    totalAmount: 75.00,
    purchaseId: 'TEST-' + Date.now()
  };

  return sendTicketPurchaseEmail(testData);
}