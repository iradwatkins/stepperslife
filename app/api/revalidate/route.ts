import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  // Revalidate all pages
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidateTag('all');
  
  return NextResponse.json({ 
    revalidated: true, 
    timestamp: new Date().toISOString(),
    message: 'Cache cleared successfully'
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;