#!/usr/bin/env tsx

import { setSecret } from '../lib/vault';

async function setupVaultSecrets() {
  console.log('Setting up Vault secrets...');
  
  try {
    // Store Google OAuth credentials
    await setSecret('stepperslife/auth', {
      nextauth_secret: process.env.NEXTAUTH_SECRET || '',
      google_client_id: process.env.GOOGLE_CLIENT_ID || '',
      google_client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      github_client_id: process.env.GITHUB_CLIENT_ID || '',
      github_client_secret: process.env.GITHUB_CLIENT_SECRET || '',
    });
    
    console.log('✓ Auth credentials stored in Vault');
    
    // Store Square credentials (placeholders for now)
    await setSecret('stepperslife/square', {
      access_token: '',
      application_id: '',
      location_id: '',
      webhook_signature_key: '',
    });
    
    console.log('✓ Square credentials (placeholders) stored in Vault');
    
    // Store Convex credentials (will be updated after initialization)
    await setSecret('stepperslife/convex', {
      url: '',
      deployment: '',
      deploy_key: '',
    });
    
    console.log('✓ Convex credentials (placeholders) stored in Vault');
    
    console.log('\n✅ All secrets have been stored in Vault successfully!');
    console.log('\nNext steps:');
    console.log('1. Run "npx convex dev" to initialize Convex and get the URL');
    console.log('2. Update Square credentials from your Square dashboard');
    console.log('3. Update GitHub OAuth credentials if needed');
    
  } catch (error) {
    console.error('Failed to setup Vault secrets:', error);
    process.exit(1);
  }
}

setupVaultSecrets();