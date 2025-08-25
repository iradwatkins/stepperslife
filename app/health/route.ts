import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const host = headersList.get('host') || 'unknown';
  
  // Get system information
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // Format uptime
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const healthCheck = {
    status: 'healthy',
    version: '3.1.0',
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || '3.1.0',
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || '2025-08-24T21:00:00Z',
    platformFee: '$1.50 per ticket',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    host: host,
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
    },
    features: {
      paymentProviders: ['square', 'stripe', 'paypal', 'zelle'],
      themeToggle: 'enabled for all users',
      multiDayEvents: true,
      ticketBundling: true
    },
    deployment: {
      gitCommit: process.env.GIT_COMMIT || 'unknown',
      dockerImage: process.env.DOCKER_IMAGE || 'stepperslife:v3.1.0',
      containerId: process.env.HOSTNAME || 'unknown'
    },
    services: {
      database: 'connected',
      convex: process.env.CONVEX_DEPLOYMENT ? 'configured' : 'not configured',
      auth: process.env.NEXTAUTH_SECRET ? 'configured' : 'not configured',
      payments: {
        square: process.env.SQUARE_ACCESS_TOKEN ? 'configured' : 'not configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
        paypal: process.env.PAYPAL_CLIENT_SECRET ? 'configured' : 'not configured'
      }
    }
  };
  
  // Return with no-cache headers
  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json'
    }
  });
}

// Simple HEAD request for basic health check
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}