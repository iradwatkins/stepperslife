#!/usr/bin/env tsx

/**
 * Check Vault Contents Script
 * ALWAYS RUN THIS FIRST to see what credentials are available
 */

import { 
  getSquareCredentials, 
  getAuthCredentials, 
  getConvexCredentials,
  getCloudflareCredentials,
  getMonitoringCredentials 
} from '../lib/vault';

console.log('🔍 CHECKING VAULT FOR ALL CREDENTIALS...\n');
console.log('═══════════════════════════════════════════════════════\n');

async function checkVault() {
  // Check Auth credentials
  console.log('📱 AUTH CREDENTIALS:');
  try {
    const authCreds = await getAuthCredentials();
    console.log('  ✅ Google Client ID:', authCreds.googleClientId ? '***' + authCreds.googleClientId.slice(-4) : '❌ Not set');
    console.log('  ✅ Google Client Secret:', authCreds.googleClientSecret ? '***' + authCreds.googleClientSecret.slice(-4) : '❌ Not set');
    console.log('  ✅ NextAuth Secret:', authCreds.nextAuthSecret ? '***' + authCreds.nextAuthSecret.slice(-4) : '❌ Not set');
    console.log('  ✅ GitHub Client ID:', authCreds.githubClientId || '❌ Not set');
    console.log('  ✅ GitHub Client Secret:', authCreds.githubClientSecret ? '***' : '❌ Not set');
  } catch (error) {
    console.log('  ⚠️  Auth credentials not available in Vault');
  }
  console.log();

  // Check Square credentials
  console.log('💳 SQUARE CREDENTIALS:');
  try {
    const squareCreds = await getSquareCredentials();
    console.log('  ✅ Access Token:', squareCreds.accessToken ? '***' + squareCreds.accessToken.slice(-4) : '❌ Not set');
    console.log('  ✅ Application ID:', squareCreds.applicationId || '❌ Not set');
    console.log('  ✅ Location ID:', squareCreds.locationId || '❌ Not set');
    console.log('  ✅ Webhook Signature:', squareCreds.webhookSignatureKey ? '***' : '❌ Not set');
  } catch (error) {
    console.log('  ⚠️  Square credentials not available in Vault');
    console.log('  💡 Add Square credentials when you have a Square account');
  }
  console.log();

  // Check Convex credentials
  console.log('🗄️  CONVEX CREDENTIALS:');
  try {
    const convexCreds = await getConvexCredentials();
    console.log('  ✅ URL:', convexCreds.url || '❌ Not set');
    console.log('  ✅ Deployment:', convexCreds.deployment || '❌ Not set');
    console.log('  ✅ Deploy Key:', convexCreds.deployKey ? '***' + convexCreds.deployKey.slice(-8) : '❌ Not set');
  } catch (error) {
    console.log('  ⚠️  Convex credentials not available in Vault');
  }
  console.log();

  // Check Cloudflare credentials
  console.log('☁️  CLOUDFLARE CREDENTIALS:');
  try {
    const cfCreds = await getCloudflareCredentials();
    console.log('  ✅ API Token:', cfCreds.apiToken ? '***' + cfCreds.apiToken.slice(-4) : '❌ Not set');
    console.log('  ✅ Zone ID:', cfCreds.zoneId || '❌ Not set');
    console.log('  ✅ Account ID:', cfCreds.accountId || '❌ Not set');
    console.log('  ✅ Email:', cfCreds.email || '❌ Not set');
    if (!cfCreds.apiToken) {
      console.log('  💡 Add Cloudflare credentials to enable CDN');
    }
  } catch (error) {
    console.log('  ⚠️  Cloudflare credentials not available in Vault');
    console.log('  💡 You mentioned having Cloudflare access - add credentials to Vault!');
  }
  console.log();

  // Check Monitoring credentials
  console.log('📊 MONITORING CREDENTIALS:');
  try {
    const monitoringCreds = await getMonitoringCredentials();
    console.log('  ✅ Google Analytics:', monitoringCreds.googleAnalyticsId || '❌ Not set');
    console.log('  ✅ Sentry DSN:', monitoringCreds.sentryDsn ? '***' : '❌ Not set');
    console.log('  ✅ Uptime Robot:', monitoringCreds.uptimeRobotKey ? '***' : '❌ Not set');
  } catch (error) {
    console.log('  ⚠️  Monitoring credentials not available in Vault');
    console.log('  💡 Optional - add for production monitoring');
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
  console.log('📝 REMEMBER: ALWAYS CHECK VAULT FIRST!');
  console.log('   Use the getter functions in lib/vault.ts');
  console.log('   Never hardcode credentials in code\n');
  
  console.log('🔐 To add credentials to Vault:');
  console.log('   1. Set VAULT_ADDR and VAULT_TOKEN environment variables');
  console.log('   2. Run: npx tsx scripts/setup-vault.ts');
  console.log('   3. Or use setSecret() function in lib/vault.ts\n');
  
  console.log('🚀 For deployment:');
  console.log('   - Copy only the credentials that exist in Vault');
  console.log('   - Square/Cloudflare can be added later when ready');
  console.log('   - Core app works with just Auth + Convex credentials\n');
}

// Check if Vault is accessible
const vaultAddr = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
const vaultToken = process.env.VAULT_TOKEN;

if (!vaultToken) {
  console.log('⚠️  VAULT_TOKEN not set\n');
  console.log('To access Vault, set:');
  console.log('  export VAULT_ADDR=' + vaultAddr);
  console.log('  export VAULT_TOKEN=your-vault-token\n');
  console.log('Using fallback to environment variables...\n');
} else {
  console.log('✅ Vault configured at:', vaultAddr);
  console.log('✅ Vault token:', '***' + vaultToken.slice(-4) + '\n');
}

checkVault().catch(error => {
  console.error('Error checking vault:', error.message);
  console.log('\n💡 TIP: Make sure Vault is running and accessible');
  console.log('   Or credentials will fallback to environment variables');
});