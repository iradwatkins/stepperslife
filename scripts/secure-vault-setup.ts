#!/usr/bin/env tsx

/**
 * Secure Vault Setup Script
 * This script helps you securely store credentials in Vault
 * and generates new ones for rotation
 */

import { setSecret } from '../lib/vault';
import * as crypto from 'crypto';
import * as readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a secure random secret
function generateSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

async function setupVaultSecrets() {
  console.log('🔐 Secure Vault Setup for SteppersLife\n');
  console.log('This script will help you:');
  console.log('1. Generate new secure secrets');
  console.log('2. Store credentials safely in Vault');
  console.log('3. Remove exposed credentials from files\n');

  // Check if Vault is accessible
  const vaultAddr = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
  console.log(`📍 Vault Address: ${vaultAddr}`);
  
  if (!process.env.VAULT_TOKEN) {
    console.log('⚠️  VAULT_TOKEN not set. Please set it first:');
    console.log('   export VAULT_TOKEN=your-vault-token\n');
    process.exit(1);
  }

  console.log('\n=== Google OAuth Setup ===\n');
  console.log('⚠️  IMPORTANT: Your current credentials are exposed in Git.');
  console.log('   You should create NEW credentials in Google Cloud Console.\n');
  
  console.log('Steps to create new credentials:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Click "Create Credentials" → "OAuth 2.0 Client ID"');
  console.log('3. Add these Authorized redirect URIs:');
  console.log('   - https://stepperslife.com/api/auth/callback/google');
  console.log('   - http://localhost:3000/api/auth/callback/google\n');

  const useNewCreds = await rl.question('Do you have NEW Google OAuth credentials? (y/n): ');
  
  let googleClientId: string;
  let googleClientSecret: string;

  if (useNewCreds.toLowerCase() === 'y') {
    googleClientId = await rl.question('Enter NEW Google Client ID: ');
    googleClientSecret = await rl.question('Enter NEW Google Client Secret: ');
  } else {
    console.log('\n⚠️  Using placeholder values. You MUST update these later!');
    googleClientId = 'PENDING_NEW_CLIENT_ID';
    googleClientSecret = 'PENDING_NEW_CLIENT_SECRET';
  }

  // Generate new Auth.js secret
  const nextAuthSecret = generateSecret();
  console.log('\n✅ Generated new NEXTAUTH_SECRET (secure random)');

  // Store in Vault
  try {
    console.log('\n📤 Storing credentials in Vault...');
    
    // Auth credentials
    await setSecret('stepperslife/auth', {
      nextauth_secret: nextAuthSecret,
      google_client_id: googleClientId,
      google_client_secret: googleClientSecret,
      github_client_id: '',
      github_client_secret: '',
    });
    console.log('✅ Auth credentials stored');

    // Square credentials (placeholders)
    await setSecret('stepperslife/square', {
      access_token: process.env.SQUARE_ACCESS_TOKEN || '',
      application_id: process.env.SQUARE_APPLICATION_ID || '',
      location_id: process.env.SQUARE_LOCATION_ID || '',
      webhook_signature_key: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
    });
    console.log('✅ Square credentials stored');

    // Convex credentials
    await setSecret('stepperslife/convex', {
      url: 'https://mild-newt-621.convex.cloud',
      deployment: 'prod:mild-newt-621',
      deploy_key: process.env.CONVEX_DEPLOY_KEY || '',
    });
    console.log('✅ Convex credentials stored');

    console.log('\n=== Vault Storage Complete ===\n');
    
    // Generate secure environment template
    console.log('📝 Creating secure environment template...\n');
    
    const envTemplate = `# Secure Environment Variables Template
# DO NOT COMMIT REAL VALUES - Use Vault or Platform Secrets

# Vault Configuration
VAULT_ADDR=${vaultAddr}
VAULT_TOKEN=[YOUR_VAULT_TOKEN]

# These will be loaded from Vault at runtime
# No need to set them directly

# For local development only
NEXT_PUBLIC_CONVEX_URL=https://little-jellyfish-146.convex.cloud
CONVEX_DEPLOYMENT=dev:little-jellyfish-146

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SteppersLife
`;

    // Write secure template
    const fs = await import('fs/promises');
    await fs.writeFile('.env.local.template', envTemplate);
    console.log('✅ Created .env.local.template (safe to commit)');

    // Update .env.local to remove real credentials
    const safeEnvLocal = `# Local Development Environment
# Credentials are loaded from Vault - do not add them here

# Vault Configuration
VAULT_ADDR=${vaultAddr}
VAULT_TOKEN=${process.env.VAULT_TOKEN || '[SET_YOUR_VAULT_TOKEN]'}

# Convex Development
NEXT_PUBLIC_CONVEX_URL=https://little-jellyfish-146.convex.cloud
CONVEX_DEPLOYMENT=dev:little-jellyfish-146

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXTAUTH_URL=http://localhost:3000

# Auth.js Secret (loaded from Vault)
# NEXTAUTH_SECRET is loaded from Vault

# OAuth (loaded from Vault)
# GOOGLE_CLIENT_ID is loaded from Vault
# GOOGLE_CLIENT_SECRET is loaded from Vault
`;

    await fs.writeFile('.env.local', safeEnvLocal);
    console.log('✅ Updated .env.local (removed credentials)');

    // Update .env.production
    const safeEnvProduction = `# Production Environment Variables for Coolify
# All sensitive values should be set in Coolify's environment settings

# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_HTTP_URL=https://mild-newt-621.convex.site
# CONVEX_DEPLOY_KEY should be set in Coolify

# Auth.js
NEXTAUTH_URL=https://stepperslife.com
# NEXTAUTH_SECRET should be set in Coolify

# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NODE_ENV=production

# All OAuth and Square credentials should be set in Coolify
`;

    await fs.writeFile('.env.production', safeEnvProduction);
    console.log('✅ Updated .env.production (removed credentials)');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SECURE SETUP COMPLETE!');
    console.log('='.repeat(50) + '\n');

    console.log('✅ What we did:');
    console.log('   1. Stored all credentials securely in Vault');
    console.log('   2. Generated new NEXTAUTH_SECRET');
    console.log('   3. Removed credentials from .env files');
    console.log('   4. Created safe templates\n');

    console.log('⚠️  CRITICAL NEXT STEPS:');
    console.log('   1. Create NEW Google OAuth credentials');
    console.log('   2. Revoke the OLD credentials:');
    console.log('      - Go to Google Cloud Console');
    console.log('      - Find credentials starting with "325543338490"');
    console.log('      - Click "Delete" or "Revoke"');
    console.log('   3. Update Vault with new credentials');
    console.log('   4. Update Coolify environment variables\n');

    console.log('📋 For Coolify, add these environment variables:');
    console.log('   VAULT_ADDR=' + vaultAddr);
    console.log('   VAULT_TOKEN=[your-vault-token]');
    console.log('   NEXTAUTH_SECRET=' + nextAuthSecret);
    if (googleClientId !== 'PENDING_NEW_CLIENT_ID') {
      console.log('   GOOGLE_CLIENT_ID=' + googleClientId);
      console.log('   GOOGLE_CLIENT_SECRET=' + googleClientSecret);
    }

  } catch (error) {
    console.error('\n❌ Failed to setup Vault:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupVaultSecrets().catch(console.error);