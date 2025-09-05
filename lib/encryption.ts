/**
 * Simple encryption utilities for sensitive data
 * Note: For production, consider using AWS KMS, Azure Key Vault, or similar
 */

import crypto from 'crypto';

// Get encryption key from environment or generate one
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!key) {
    console.warn('No encryption key found. Using default key (NOT SECURE FOR PRODUCTION)');
    return 'default-encryption-key-replace-in-production';
  }
  return key;
};

// Derive a 32-byte key from the encryption key
const deriveKey = (key: string): Buffer => {
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypt a string value
 */
export function encrypt(text: string): string {
  try {
    const key = deriveKey(getEncryptionKey());
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string value
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = deriveKey(getEncryptionKey());
    const parts = encryptedText.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value (one-way, cannot be decrypted)
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Mask sensitive data for display
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) {
    return '••••••••';
  }
  
  const visible = value.substring(0, visibleChars);
  const masked = '•'.repeat(Math.min(8, value.length - visibleChars));
  
  return visible + masked;
}

/**
 * Encrypt payment credentials
 */
export function encryptCredentials(credentials: Record<string, any>): Record<string, any> {
  const encrypted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(credentials)) {
    if (!value) {
      encrypted[key] = value;
      continue;
    }
    
    // Encrypt sensitive fields
    const sensitiveFields = [
      'accessToken',
      'secretKey',
      'clientSecret',
      'webhookSecret',
      'refreshToken',
      'apiKey',
      'privateKey',
    ];
    
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      encrypted[key] = encrypt(String(value));
    } else {
      encrypted[key] = value;
    }
  }
  
  return encrypted;
}

/**
 * Decrypt payment credentials
 */
export function decryptCredentials(encryptedCredentials: Record<string, any>): Record<string, any> {
  const decrypted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(encryptedCredentials)) {
    if (!value || typeof value !== 'string') {
      decrypted[key] = value;
      continue;
    }
    
    // Check if this looks like encrypted data (contains colon separator)
    if (value.includes(':') && value.length > 32) {
      try {
        decrypted[key] = decrypt(value);
      } catch {
        // If decryption fails, return as-is (might not be encrypted)
        decrypted[key] = value;
      }
    } else {
      decrypted[key] = value;
    }
  }
  
  return decrypted;
}

/**
 * Validate API credentials format
 */
export function validateCredentials(provider: string, credentials: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  switch (provider) {
    case 'square':
      if (!credentials.accessToken || credentials.accessToken.length < 20) {
        errors.push('Invalid Square Access Token');
      }
      if (!credentials.applicationId || !credentials.applicationId.includes('-')) {
        errors.push('Invalid Square Application ID');
      }
      if (!credentials.locationId) {
        errors.push('Square Location ID is required');
      }
      break;
      
    case 'paypal':
      if (!credentials.clientId || credentials.clientId.length < 20) {
        errors.push('Invalid PayPal Client ID');
      }
      if (!credentials.clientSecret || credentials.clientSecret.length < 20) {
        errors.push('Invalid PayPal Client Secret');
      }
      break;
      
    case 'stripe':
      if (!credentials.publishableKey || !credentials.publishableKey.startsWith('pk_')) {
        errors.push('Invalid Stripe Publishable Key (should start with pk_)');
      }
      if (!credentials.secretKey || !credentials.secretKey.startsWith('sk_')) {
        errors.push('Invalid Stripe Secret Key (should start with sk_)');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}