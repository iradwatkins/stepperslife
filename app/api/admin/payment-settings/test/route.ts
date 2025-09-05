import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getSquareClient } from '@/lib/square-client';
import { getPayPalClientWrapper } from '@/lib/paypal-client';

// Admin emails that have access
const ADMIN_EMAILS = [
  'bobbygwatkins@gmail.com',
  'iradwatkins@gmail.com',
];

/**
 * Check if user is admin
 */
async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user || !user.primaryEmailAddress) return false;
  return ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);
}

/**
 * POST /api/admin/payment-settings/test
 * Test a payment provider configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    let testResult = {
      success: false,
      message: '',
      details: null as any,
    };

    switch (provider) {
      case 'square':
        try {
          const squareClient = getSquareClient();
          
          // Test Square connection by fetching locations
          const locationsResponse = await squareClient.locationsApi.listLocations();
          
          if (locationsResponse.result.locations && locationsResponse.result.locations.length > 0) {
            testResult = {
              success: true,
              message: 'Square connection successful',
              details: {
                locationsCount: locationsResponse.result.locations.length,
                primaryLocation: locationsResponse.result.locations[0].name,
                environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
                cashAppPayEnabled: process.env.CASHAPP_PAY_ENABLED === 'true',
              },
            };
          } else {
            testResult = {
              success: false,
              message: 'Square connected but no locations found',
              details: null,
            };
          }
        } catch (error: any) {
          console.error('Square test error:', error);
          testResult = {
            success: false,
            message: error.message || 'Failed to connect to Square',
            details: error.errors || null,
          };
        }
        break;

      case 'paypal':
        try {
          const paypalClient = getPayPalClientWrapper();
          
          // Test PayPal connection by creating a test order
          const testOrder = {
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: '1.00',
              },
              description: 'Connection test',
            }],
          };
          
          const request = new (paypalClient.client.orders.OrdersCreateRequest as any)();
          request.prefer('return=representation');
          request.requestBody(testOrder);
          
          const response = await paypalClient.client.execute(request);
          
          if (response.statusCode === 201) {
            testResult = {
              success: true,
              message: 'PayPal connection successful',
              details: {
                environment: process.env.PAYPAL_MODE || 'sandbox',
                testOrderId: response.result.id,
              },
            };
            
            // Cancel the test order
            if (response.result.id) {
              try {
                const cancelRequest = new (paypalClient.client.orders.OrdersCancelRequest as any)(response.result.id);
                await paypalClient.client.execute(cancelRequest);
              } catch (cancelError) {
                // Ignore cancel errors for test orders
              }
            }
          } else {
            testResult = {
              success: false,
              message: 'PayPal connected but test order failed',
              details: null,
            };
          }
        } catch (error: any) {
          console.error('PayPal test error:', error);
          testResult = {
            success: false,
            message: error.message || 'Failed to connect to PayPal',
            details: error.details || null,
          };
        }
        break;

      case 'stripe':
        testResult = {
          success: false,
          message: 'Stripe integration not yet implemented',
          details: null,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing payment provider:', error);
    return NextResponse.json(
      { error: 'Failed to test payment provider' },
      { status: 500 }
    );
  }
}