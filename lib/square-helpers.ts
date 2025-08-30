/**
 * Square SDK Helper Functions
 * Handles BigInt serialization and other Square-specific issues
 */

/**
 * Serializes Square API responses to handle BigInt values
 * Converts BigInt to strings to prevent JSON serialization errors
 */
export function serializeSquareResponse(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof Error) {
      return {
        error: true,
        message: value.message,
        stack: value.stack,
      };
    }
    return value;
  }));
}

/**
 * Safely converts money amounts from Square (in cents) to dollars
 */
export function formatSquareMoney(amountInCents: number | bigint | string): string {
  const cents = typeof amountInCents === 'bigint' 
    ? Number(amountInCents) 
    : typeof amountInCents === 'string'
    ? parseInt(amountInCents, 10)
    : amountInCents;
    
  return (cents / 100).toFixed(2);
}

/**
 * Converts dollar amount to Square money format (cents)
 */
export function toSquareMoney(dollars: number | string): number {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
}

/**
 * Validates Square webhook signature
 */
export function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string,
  url: string
): boolean {
  // In development or when Square is disabled, bypass validation
  if (process.env.NODE_ENV === 'development' || process.env.DISABLE_SQUARE === 'true') {
    return true;
  }
  
  try {
    // This would normally use Square's webhook validation
    // For now, return true if signature exists
    return !!signature;
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
}

/**
 * Safe error handler for Square API errors
 */
export function handleSquareError(error: any): { 
  success: false; 
  error: string; 
  details?: any 
} {
  console.error('Square API Error:', error);
  
  if (error?.errors) {
    // Square API error format
    return {
      success: false,
      error: error.errors[0]?.detail || 'Square API error',
      details: error.errors
    };
  }
  
  if (error?.message) {
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
  
  return {
    success: false,
    error: 'Unknown Square error occurred',
    details: error
  };
}