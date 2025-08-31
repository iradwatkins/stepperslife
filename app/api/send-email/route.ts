import { NextRequest, NextResponse } from 'next/server';
import { sendTicketPurchaseEmail, sendTestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a test email request
    if (body.test) {
      const result = await sendTestEmail(body.email || 'Appvillagellc@gmail.com');
      return NextResponse.json(result);
    }
    
    // Validate required fields
    if (!body.buyerEmail || !body.buyerName || !body.tickets || !body.eventName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Send the actual purchase confirmation email
    const result = await sendTicketPurchaseEmail(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}