import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId
  const error = searchParams.get('error');
  
  // Handle OAuth errors
  if (error) {
    console.error('Square OAuth error:', error);
    return NextResponse.redirect('/seller?error=oauth_failed');
  }
  
  if (!code || !state) {
    return NextResponse.redirect('/seller?error=missing_params');
  }
  
  try {
    // Exchange authorization code for access token
    const tokenUrl = process.env.NODE_ENV === 'production'
      ? 'https://connect.squareup.com/oauth2/token'
      : 'https://connect.squareupsandbox.com/oauth2/token';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        client_id: process.env.SQUARE_APPLICATION_ID,
        client_secret: process.env.SQUARE_APPLICATION_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect('/seller?error=token_exchange_failed');
    }
    
    const data = await response.json();
    
    // Get merchant details
    const merchantResponse = await fetch('https://connect.squareup.com/v2/merchants/me', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Square-Version': '2024-01-18',
      },
    });
    
    const merchantData = await merchantResponse.json();
    
    // Get locations
    const locationsResponse = await fetch('https://connect.squareup.com/v2/locations', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Square-Version': '2024-01-18',
      },
    });
    
    const locationsData = await locationsResponse.json();
    const mainLocation = locationsData.locations?.[0];
    
    // Save seller's Square credentials
    const convex = getConvexClient();
    await convex.mutation(api.users.updateSquareCredentials, {
      userId: state,
      squareAccessToken: data.access_token,
      squareMerchantId: data.merchant_id || merchantData.merchant?.id,
      squareRefreshToken: data.refresh_token,
      squareLocationId: mainLocation?.id,
    });
    
    // Redirect back to seller dashboard with success
    return NextResponse.redirect('/seller?success=square_connected');
    
  } catch (error) {
    console.error('Square OAuth callback error:', error);
    return NextResponse.redirect('/seller?error=oauth_error');
  }
}