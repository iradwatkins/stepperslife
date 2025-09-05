import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { getSquareClient } from '@/lib/square-client';
import { isPayPalConfigured, getPayPalClientWrapper } from '@/lib/paypal-client';
import { isCashAppPayAvailable, getCashAppPayStatus } from '@/lib/cashapp-pay-sdk';

// Admin user IDs - should match the ones in Convex
const ADMIN_USER_IDS = [
  'user_2qYrQkP7dQH4VgNfHQYjKQoJQxJ', // Replace with actual admin IDs
];

/**
 * Check if user is admin
 */
function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * GET /api/admin/payment-settings
 * Get all payment provider configurations
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const convex = getConvexClient();

    // Get payment settings from database
    const settings = await convex.query(api.adminPaymentSettings.getAllPaymentSettings, {
      userId,
    });

    // Get current provider status from SDKs
    const squareClient = getSquareClient();
    const cashAppStatus = getCashAppPayStatus();
    const paypalConfigured = isPayPalConfigured();

    // Combine database settings with SDK status
    const response = {
      providers: {
        square: {
          configured: squareClient.isReady(),
          enabled: settings?.find(s => s.provider === 'square')?.enabled || false,
          environment: squareClient.getEnvironment(),
          locationId: squareClient.getLocationId(),
          applicationId: squareClient.getApplicationId(),
          ...settings?.find(s => s.provider === 'square'),
        },
        cashapp: {
          configured: cashAppStatus.configured,
          enabled: isCashAppPayAvailable(),
          ...cashAppStatus,
          ...settings?.find(s => s.provider === 'cashapp'),
        },
        paypal: {
          configured: paypalConfigured,
          enabled: settings?.find(s => s.provider === 'paypal')?.enabled || false,
          mode: getPayPalClientWrapper().getMode(),
          clientId: paypalConfigured ? getPayPalClientWrapper().getClientId().substring(0, 10) + '...' : null,
          ...settings?.find(s => s.provider === 'paypal'),
        },
      },
      platformSettings: {
        platformFeePerTicket: process.env.PLATFORM_FEE_PER_TICKET || '1.50',
        paymentProcessingMode: process.env.PAYMENT_PROCESSING_MODE || 'split',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payment-settings
 * Update payment provider configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, settings } = body;

    if (!provider || !settings) {
      return NextResponse.json(
        { error: 'Provider and settings are required' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Update settings in database
    const result = await convex.mutation(api.adminPaymentSettings.upsertPaymentSettings, {
      userId,
      provider,
      ...settings,
    });

    // If updating Square/PayPal, reinitialize the clients
    if (provider === 'square' && settings.credentials?.squareAccessToken) {
      // Square client will reinitialize on next use with new env vars
      console.log('Square settings updated - client will reinitialize');
    }

    if (provider === 'paypal' && settings.credentials?.paypalClientId) {
      // Update PayPal client configuration
      getPayPalClientWrapper().updateConfig(
        settings.credentials.paypalClientId,
        settings.credentials.paypalClientSecret,
        settings.environment === 'production' ? 'live' : 'sandbox'
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider} settings updated successfully`,
      result,
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payment-settings/test
 * Test payment provider connection
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    let testResult = {
      success: false,
      message: '',
      details: {},
    };

    // Test the provider connection
    switch (provider) {
      case 'square':
      case 'cashapp': {
        try {
          const client = getSquareClient();
          if (!client.isReady()) {
            throw new Error('Square client not initialized');
          }

          // Test by fetching locations
          const locationsApi = client.getClient().locationsApi;
          const response = await locationsApi.listLocations();
          
          if (response.result.errors && response.result.errors.length > 0) {
            throw new Error(response.result.errors[0].detail);
          }

          testResult = {
            success: true,
            message: 'Square connection successful',
            details: {
              locationCount: response.result.locations?.length || 0,
              environment: client.getEnvironment(),
              cashAppEnabled: client.isCashAppPayEnabled(),
            },
          };
        } catch (error: any) {
          testResult = {
            success: false,
            message: `Square connection failed: ${error.message}`,
            details: {},
          };
        }
        break;
      }

      case 'paypal': {
        try {
          if (!isPayPalConfigured()) {
            throw new Error('PayPal not configured');
          }

          // Test by creating a minimal order
          const order = await getPayPalClientWrapper().createOrder(0.01, 'USD', 'Connection test');
          
          if (!order.id) {
            throw new Error('Failed to create test order');
          }

          testResult = {
            success: true,
            message: 'PayPal connection successful',
            details: {
              mode: getPayPalClientWrapper().getMode(),
              testOrderId: order.id,
            },
          };
        } catch (error: any) {
          testResult = {
            success: false,
            message: `PayPal connection failed: ${error.message}`,
            details: {},
          };
        }
        break;
      }

      default:
        testResult = {
          success: false,
          message: `Unknown provider: ${provider}`,
          details: {},
        };
    }

    // Update test status in database
    const convex = getConvexClient();
    await convex.mutation(api.adminPaymentSettings.testProviderConnection, {
      userId,
      provider,
    });

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing payment provider:', error);
    return NextResponse.json(
      { error: 'Failed to test payment provider' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/payment-settings
 * Disable a payment provider
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Disable the provider
    const result = await convex.mutation(api.adminPaymentSettings.toggleProviderStatus, {
      userId,
      provider,
      enabled: false,
    });

    return NextResponse.json({
      success: true,
      message: `${provider} disabled successfully`,
      result,
    });
  } catch (error) {
    console.error('Error disabling payment provider:', error);
    return NextResponse.json(
      { error: 'Failed to disable payment provider' },
      { status: 500 }
    );
  }
}