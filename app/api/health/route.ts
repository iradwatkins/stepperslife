import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    app: 'SteppersLife',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    deployment: 'CORRECT_REPO_DEPLOYED',
    test: '🚀 GREEN BANNER SHOULD BE VISIBLE'
  });
}