import vault from 'node-vault';

// Initialize Vault client
const vaultClient = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN,
});

// Cache for secrets to reduce API calls
const secretCache = new Map<string, { value: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a secret from Vault with caching
 */
export async function getSecret(path: string): Promise<any> {
  // Check cache first
  const cached = secretCache.get(path);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  // Skip Vault during build time
  if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
    return {};
  }

  try {
    // Fetch from Vault
    const result = await vaultClient.read(`secret/data/${path}`);
    const value = result.data.data;
    
    // Cache the result
    secretCache.set(path, {
      value,
      expiry: Date.now() + CACHE_TTL,
    });
    
    return value;
  } catch (error: any) {
    // If connection refused, return empty object to allow fallback
    if (error?.code === 'ECONNREFUSED') {
      console.warn(`Vault not available at ${process.env.VAULT_ADDR || 'http://127.0.0.1:8200'}`);
      return {};
    }
    console.error(`Failed to fetch secret from Vault: ${path}`, error);
    throw new Error(`Unable to retrieve secret: ${path}`);
  }
}

/**
 * Store a secret in Vault
 */
export async function setSecret(path: string, data: Record<string, any>): Promise<void> {
  try {
    await vaultClient.write(`secret/data/${path}`, {
      data,
    });
    
    // Invalidate cache
    secretCache.delete(path);
  } catch (error) {
    console.error(`Failed to store secret in Vault: ${path}`, error);
    throw new Error(`Unable to store secret: ${path}`);
  }
}

/**
 * Get Square credentials from Vault
 */
export async function getSquareCredentials() {
  const secrets = await getSecret('stepperslife/square');
  return {
    accessToken: secrets.access_token,
    applicationId: secrets.application_id,
    locationId: secrets.location_id,
    webhookSignatureKey: secrets.webhook_signature_key,
  };
}

/**
 * Get Auth.js credentials from Vault
 */
export async function getAuthCredentials() {
  const secrets = await getSecret('stepperslife/auth');
  return {
    nextAuthSecret: secrets.nextauth_secret,
    googleClientId: secrets.google_client_id,
    googleClientSecret: secrets.google_client_secret,
    githubClientId: secrets.github_client_id,
    githubClientSecret: secrets.github_client_secret,
  };
}

/**
 * Get Convex credentials from Vault
 */
export async function getConvexCredentials() {
  const secrets = await getSecret('stepperslife/convex');
  return {
    url: secrets.url,
    deployment: secrets.deployment,
    deployKey: secrets.deploy_key,
  };
}

/**
 * Initialize all secrets in Vault (run once during setup)
 */
export async function initializeVaultSecrets() {
  // Square secrets
  await setSecret('stepperslife/square', {
    access_token: process.env.SQUARE_ACCESS_TOKEN || '',
    application_id: process.env.SQUARE_APPLICATION_ID || '',
    location_id: process.env.SQUARE_LOCATION_ID || '',
    webhook_signature_key: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
  });

  // Auth.js secrets
  await setSecret('stepperslife/auth', {
    nextauth_secret: process.env.NEXTAUTH_SECRET || '',
    google_client_id: process.env.GOOGLE_CLIENT_ID || '',
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    github_client_id: process.env.GITHUB_CLIENT_ID || '',
    github_client_secret: process.env.GITHUB_CLIENT_SECRET || '',
  });

  // Convex secrets
  await setSecret('stepperslife/convex', {
    url: process.env.NEXT_PUBLIC_CONVEX_URL || '',
    deployment: process.env.CONVEX_DEPLOYMENT || '',
    deploy_key: process.env.CONVEX_DEPLOY_KEY || '',
  });

  console.log('Vault secrets initialized successfully');
}

export default vaultClient;