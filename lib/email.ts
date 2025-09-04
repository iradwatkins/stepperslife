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
      <div style="background: linear-gradient(135deg, #00c7fc 0%, #1F2937 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
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

// Send platform fee reminder email
export async function sendPlatformFeeReminder(data: {
  organizerEmail: string;
  organizerName: string;
  eventName: string;
  totalCashSales: number;
  platformFeeDue: number;
  daysUntilEvent: number;
  paymentUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const urgency = data.daysUntilEvent <= 3 ? 'URGENT' : 'Reminder';
  const subject = `${urgency}: Platform Fee Payment Due - $${data.platformFeeDue.toFixed(2)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Platform Fee Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${data.daysUntilEvent <= 3 ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">${urgency}: Platform Fee Payment Required</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear ${data.organizerName},</p>
        
        <p>You have recorded <strong>${data.totalCashSales} cash sales</strong> for <strong>${data.eventName}</strong>.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b;">Platform Fee Due: $${data.platformFeeDue.toFixed(2)}</h3>
          <p style="margin: 0;">This fee must be paid to keep your event tickets active.</p>
          ${data.daysUntilEvent <= 3 ? '<p style="margin: 10px 0 0 0; font-weight: bold;">⚠️ Your event is in ' + data.daysUntilEvent + ' days!</p>' : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Pay Platform Fee Now
          </a>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">Why Platform Fees?</h4>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Secure ticket generation and QR codes</li>
            <li>Real-time scanning and validation</li>
            <li>Customer support and dispute resolution</li>
            <li>Marketing and platform maintenance</li>
          </ul>
        </div>
        
        <p>If you have any questions, please contact support@stepperslife.com</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Platform fee reminder would be sent to:', data.organizerEmail);
      return { success: true };
    }
    
    const msg = {
      to: data.organizerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'billing@stepperslife.com',
      subject,
      html,
    };
    
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending platform fee reminder:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send affiliate payment confirmation
export async function sendAffiliatePaymentConfirmation(data: {
  affiliateEmail: string;
  affiliateName: string;
  organizerName: string;
  eventName: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  confirmationUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">💰 Payment Notification</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hi ${data.affiliateName},</p>
        
        <p>Great news! <strong>${data.organizerName}</strong> has recorded a commission payment for your referrals to <strong>${data.eventName}</strong>.</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0; color: #166534;">Payment Details</h3>
          <p style="margin: 10px 0;"><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Method:</strong> ${data.paymentMethod}</p>
          ${data.paymentReference ? `<p style="margin: 10px 0;"><strong>Reference:</strong> ${data.paymentReference}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.confirmationUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Confirm Payment Received
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Please confirm once you've received the payment. If there are any issues, you can dispute the payment using the link above.
        </p>
        
        <p>Thank you for promoting our events!</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Affiliate payment confirmation would be sent to:', data.affiliateEmail);
      return { success: true };
    }
    
    const msg = {
      to: data.affiliateEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'affiliates@stepperslife.com',
      subject: `Payment Notification: $${data.amount.toFixed(2)} from ${data.organizerName}`,
      html,
    };
    
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending affiliate payment confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send platform fee payment confirmation
export async function sendPlatformFeePaymentConfirmation(data: {
  organizerEmail: string;
  organizerName: string;
  amount: number;
  newBalance: number;
  paymentMethod: string;
  receiptUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">✅ Payment Received</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear ${data.organizerName},</p>
        
        <p>Thank you for your platform fee payment!</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0;">Payment Details</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0;"><strong>Amount Paid:</strong></td>
              <td style="text-align: right;">$${data.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
              <td style="text-align: right;">${data.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>New Balance:</strong></td>
              <td style="text-align: right; ${data.newBalance > 0 ? 'color: #dc2626;' : 'color: #10b981;'}">
                $${data.newBalance.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>
        
        ${data.newBalance > 0 ? `
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Remaining Balance:</strong> You still have an outstanding balance of $${data.newBalance.toFixed(2)}.</p>
          </div>
        ` : `
          <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Account Status:</strong> Your account is in good standing. All fees are paid!</p>
          </div>
        `}
        
        ${data.receiptUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.receiptUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
              View Receipt
            </a>
          </div>
        ` : ''}
        
        <p>Thank you for using SteppersLife!</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Platform fee payment confirmation would be sent to:', data.organizerEmail);
      return { success: true };
    }
    
    const msg = {
      to: data.organizerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'billing@stepperslife.com',
      subject: `Payment Received: $${data.amount.toFixed(2)} - SteppersLife`,
      html,
    };
    
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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